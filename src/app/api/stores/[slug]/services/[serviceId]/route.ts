import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { serializeService, serviceQueryInclude } from "@/lib/services";
import { updateServiceSchema } from "@/lib/validations/service";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

async function getOwnerStore(slug: string, ownerId: string) {
  return db.store.findFirst({
    where: { slug, ownerId },
    select: { id: true },
  });
}

async function findOwnedService(storeId: string, serviceId: string) {
  const service = await db.service.findFirst({
    where: { id: serviceId, storeId },
    include: serviceQueryInclude,
  });

  return service ? serializeService(service as never) : null;
}

export async function PATCH(request: Request, { params }: { params: { slug: string; serviceId: string } }) {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Silakan login terlebih dahulu" }, { status: 401 });
  }

  const store = await getOwnerStore(params.slug, session.user.id);
  if (!store) {
    return NextResponse.json({ success: false, error: "Toko tidak ditemukan" }, { status: 404 });
  }

  const current = await findOwnedService(store.id, params.serviceId);
  if (!current) {
    return NextResponse.json({ success: false, error: "Layanan tidak ditemukan" }, { status: 404 });
  }

  const parsed = updateServiceSchema.safeParse(await request.json());
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
    const updated = await db.$transaction(async (tx) => {
      const latest = await tx.service.findFirst({
        where: { id: params.serviceId, storeId: store.id },
        include: serviceQueryInclude,
      });

      if (!latest) {
        return null;
      }

      const finalCategory = input.category ?? latest.category;
      const isExpress = finalCategory === "EXPRESS";
      const finalBaseServiceId = isExpress ? input.baseServiceId ?? latest.baseServiceId : null;
      const finalPriceMultiplier = isExpress ? input.priceMultiplier ?? latest.prices[0]?.priceMultiplier ?? null : null;

      let finalPrice = input.price ?? latest.prices[0]?.price ?? 0;
      if (isExpress) {
        if (!finalBaseServiceId) {
          throw new Error("Layanan dasar express wajib dipilih");
        }

        const baseService = await tx.service.findFirst({
          where: { id: finalBaseServiceId, storeId: store.id, category: "KILOAN" },
          include: serviceQueryInclude,
        });

        if (!baseService) {
          throw new Error("Layanan dasar express tidak valid");
        }

        const basePrice = baseService.prices[0]?.price ?? 0;
        if (finalPriceMultiplier == null) {
          throw new Error("Multiplier express wajib diisi");
        }

        finalPrice = Math.round(basePrice * finalPriceMultiplier);
      }

      const service = await tx.service.update({
        where: { id: params.serviceId },
        data: {
          name: input.name?.trim() ?? latest.name,
          category: finalCategory,
          baseServiceId: finalBaseServiceId,
          isActive: input.isActive ?? latest.isActive,
        },
        include: serviceQueryInclude,
      });

      const priceRecord = latest.prices[0];
      if (priceRecord) {
        await tx.servicePrice.update({
          where: { id: priceRecord.id },
          data: {
            price: finalPrice,
            priceMultiplier: finalPriceMultiplier,
          },
        });
      } else {
        await tx.servicePrice.create({
          data: {
            serviceId: params.serviceId,
            price: finalPrice,
            priceMultiplier: finalPriceMultiplier,
            isDefault: true,
          },
        });
      }

      const refreshed = await tx.service.findFirst({
        where: { id: params.serviceId, storeId: store.id },
        include: serviceQueryInclude,
      });

      return refreshed ? serializeService(refreshed as never) : null;
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: "Layanan tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { service: updated } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal memperbarui layanan";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { slug: string; serviceId: string } }) {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Silakan login terlebih dahulu" }, { status: 401 });
  }

  const store = await getOwnerStore(params.slug, session.user.id);
  if (!store) {
    return NextResponse.json({ success: false, error: "Toko tidak ditemukan" }, { status: 404 });
  }

  const service = await db.service.findFirst({
    where: { id: params.serviceId, storeId: store.id },
    select: { id: true, isActive: true },
  });

  if (!service) {
    return NextResponse.json({ success: false, error: "Layanan tidak ditemukan" }, { status: 404 });
  }

  await db.service.update({
    where: { id: params.serviceId },
    data: { isActive: false },
  });

  return NextResponse.json({ success: true, data: { serviceId: params.serviceId, isActive: false } });
}
