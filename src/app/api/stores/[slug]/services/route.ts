import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { serializeService, serviceQueryInclude } from "@/lib/services";
import { createServiceSchema } from "@/lib/validations/service";
import type { Prisma } from "@prisma/client";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

async function getOwnerStore(slug: string, ownerId: string) {
  return db.store.findFirst({
    where: { slug, ownerId },
    select: { id: true },
  });
}

async function getServices(storeId: string, includeInactive = false) {
  const services = await db.service.findMany({
    where: {
      storeId,
      ...(includeInactive ? {} : { isActive: true }),
    },
    orderBy: [{ isActive: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
    include: serviceQueryInclude,
  });

  return services.map((service) => serializeService(service as never));
}

async function nextSortOrder(
  client: Prisma.TransactionClient,
  storeId: string,
) {
  const latest = await client.service.findFirst({
    where: { storeId },
    orderBy: [{ sortOrder: "desc" }, { createdAt: "desc" }],
    select: { sortOrder: true },
  });

  return (latest?.sortOrder ?? -1) + 1;
}

async function resolveExpressBaseService(
  client: Prisma.TransactionClient,
  storeId: string,
  baseServiceId: string,
) {
  const baseService = await client.service.findFirst({
    where: { id: baseServiceId, storeId, category: "KILOAN" },
    include: serviceQueryInclude,
  });

  if (!baseService) {
    return null;
  }

  return serializeService(baseService as never);
}

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Silakan login terlebih dahulu" }, { status: 401 });
  }

  const store = await getOwnerStore(params.slug, session.user.id);
  if (!store) {
    return NextResponse.json({ success: false, error: "Toko tidak ditemukan" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const includeInactive = searchParams.get("includeInactive") === "1";

  return NextResponse.json({
    success: true,
    data: {
      services: await getServices(store.id, includeInactive),
    },
  });
}

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Silakan login terlebih dahulu" }, { status: 401 });
  }

  const store = await getOwnerStore(params.slug, session.user.id);
  if (!store) {
    return NextResponse.json({ success: false, error: "Toko tidak ditemukan" }, { status: 404 });
  }

  const parsed = createServiceSchema.safeParse(await request.json());
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      {
        success: false,
        error: "Data layanan belum lengkap",
        detail: issue ? `${issue.path.join(".")}: ${issue.message}` : "Payload invalid",
      },
      { status: 400 },
    );
  }

  const input = parsed.data;

  try {
    const created = await db.$transaction(async (tx) => {
      const sortOrder = await nextSortOrder(tx, store.id);
      const isExpress = input.category === "EXPRESS";
      const baseService =
        isExpress && input.baseServiceId
          ? await resolveExpressBaseService(tx, store.id, input.baseServiceId)
          : null;

      if (isExpress && !baseService) {
        throw new Error("Layanan dasar express tidak valid");
      }

      const priceMultiplier = isExpress ? input.priceMultiplier ?? null : null;
      const finalPrice = isExpress
        ? Math.round((baseService?.price ?? 0) * (priceMultiplier ?? 0))
        : input.price;

      const service = await tx.service.create({
        data: {
          storeId: store.id,
          name: input.name.trim(),
          category: input.category,
          baseServiceId: isExpress ? input.baseServiceId : null,
          isActive: input.isActive ?? true,
          sortOrder,
          prices: {
            create: {
              price: finalPrice,
              priceMultiplier,
              isDefault: true,
            },
          },
        },
        include: serviceQueryInclude,
      });

      return serializeService(service as never);
    });

    return NextResponse.json({ success: true, data: { service: created } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menambah layanan";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
