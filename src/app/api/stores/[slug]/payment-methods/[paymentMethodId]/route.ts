import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { serializePaymentMethod } from "@/lib/payment-methods";
import { updatePaymentMethodSchema } from "@/lib/validations/payment-method";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

async function getOwnerStore(slug: string, ownerId: string) {
  return db.store.findFirst({
    where: { slug, ownerId },
    select: { id: true },
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: { slug: string; paymentMethodId: string } },
) {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Silakan login terlebih dahulu" }, { status: 401 });
  }

  const store = await getOwnerStore(params.slug, session.user.id);
  if (!store) {
    return NextResponse.json({ success: false, error: "Toko tidak ditemukan" }, { status: 404 });
  }

  const current = await db.paymentMethod.findFirst({
    where: {
      id: params.paymentMethodId,
      storeId: store.id,
    },
  });

  if (!current) {
    return NextResponse.json({ success: false, error: "Metode pembayaran tidak ditemukan" }, { status: 404 });
  }

  const parsed = updatePaymentMethodSchema.safeParse(await request.json());
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      {
        success: false,
        error: "Data metode pembayaran belum lengkap",
        detail: issue ? `${issue.path.join(".")}: ${issue.message}` : "Payload invalid",
      },
      { status: 400 },
    );
  }

  const updated = await db.paymentMethod.update({
    where: { id: current.id },
    data: {
      isActive: parsed.data.isActive ?? current.isActive,
    },
  });

  return NextResponse.json({
    success: true,
    data: {
      paymentMethod: serializePaymentMethod(updated),
    },
  });
}
