import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { normalizePhone } from "@/lib/phone";
import { slugifyStoreName } from "@/lib/slug";
import { createStoreSchema } from "@/lib/validations/store";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

async function uniqueSlug(base: string) {
  const cleanBase = base || "laundry";
  let candidate = cleanBase;
  let suffix = 2;

  while (await db.store.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    candidate = `${cleanBase}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Silakan login dengan Google terlebih dahulu" }, { status: 401 });
    }

    const parsed = createStoreSchema.safeParse(await request.json());
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const field = firstIssue?.path?.join(".") || "form";
      return NextResponse.json(
        {
          success: false,
          error: "Data onboarding belum lengkap",
          detail: `${field}: ${firstIssue?.message || "invalid"}`,
        },
        { status: 400 }
      );
    }

    const existingStore = await db.store.findFirst({
      where: { ownerId: session.user.id },
      select: { slug: true },
    });

    if (existingStore) {
      return NextResponse.json(
        { success: false, error: "Akun ini sudah memiliki toko", slug: existingStore.slug },
        { status: 409 }
      );
    }

    const input = parsed.data;
    const slug = await uniqueSlug(slugifyStoreName(input.store.slug || input.store.name));
    const storePhone = normalizePhone(input.store.phone);
    const whatsappPhone = normalizePhone(input.store.whatsappPhone);
    const branchPhone = normalizePhone(input.branch.phone);
    const qrisImageUrl = input.paymentMethods.includes("QRIS") ? input.qrisImageUrl || null : null;
    const staff = input.staff?.enabled ? input.staff : null;

    if (staff && (!staff.name || !staff.phone || !staff.pin)) {
      return NextResponse.json({ success: false, error: "Data staf belum lengkap" }, { status: 400 });
    }

    await db.$transaction(async (tx) => {
      const store = await tx.store.create({
        data: {
          name: input.store.name,
          slug,
          ownerId: session.user.id,
          phone: storePhone,
          whatsappPhone,
          address: input.store.address,
          logoUrl: input.store.logoUrl || null,
          qrisImageUrl,
        },
      });

      const branch = await tx.branch.create({
        data: {
          storeId: store.id,
          name: input.branch.name,
          code: input.branch.code.toUpperCase(),
          address: input.branch.address,
          phone: branchPhone,
        },
      });

      const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await tx.subscription.create({
        data: {
          storeId: store.id,
          planType: "FREE",
          status: "TRIALING",
          trialEndsAt,
        },
      });

      let kiloanServiceId: string | null = null;
      for (let index = 0; index < input.services.length; index += 1) {
        const service = input.services[index];
        const created: { id: string } = await tx.service.create({
          select: { id: true },
          data: {
            storeId: store.id,
            name: service.name,
            category: service.category,
            baseServiceId: service.category === "EXPRESS" ? kiloanServiceId : null,
            sortOrder: index,
            prices: {
              create: {
                price: service.category === "EXPRESS" ? 0 : service.price,
                priceMultiplier: service.category === "EXPRESS" ? service.priceMultiplier || 1.5 : null,
                isDefault: true,
              },
            },
          },
        });

        if (!kiloanServiceId && service.category === "KILOAN") {
          kiloanServiceId = created.id;
        }
      }

      await tx.paymentMethod.createMany({
        data: input.paymentMethods.map((type) => ({
          storeId: store.id,
          type,
          name: type === "CASH" ? "Tunai" : type === "TRANSFER" ? "Transfer" : "QRIS",
        })),
      });

      if (staff?.enabled && staff.name && staff.phone && staff.pin) {
        const phone = normalizePhone(staff.phone);
        const user = await tx.user.upsert({
          where: { email: `${phone}@staff.laundryku.local` },
          create: {
            name: staff.name,
            email: `${phone}@staff.laundryku.local`,
            phone,
            emailVerified: true,
          },
          update: {
            name: staff.name,
            phone,
          },
        });

        await tx.staffMember.create({
          data: {
            userId: user.id,
            storeId: store.id,
            branchId: branch.id,
            role: staff.role,
            pinHash: await bcrypt.hash(staff.pin, 12),
          },
        });
      }
    });

    return NextResponse.json({ success: true, slug });
  } catch {
    return NextResponse.json({ success: false, error: "Toko gagal dibuat" }, { status: 500 });
  }
}
