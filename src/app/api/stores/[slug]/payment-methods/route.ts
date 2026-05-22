import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { serializePaymentMethod } from "@/lib/payment-methods";
import { isOwnedStoreUploadUrl } from "@/lib/upload";
import { updatePaymentMethodSettingsSchema } from "@/lib/validations/payment-method";
import { del } from "@vercel/blob";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

async function getOwnerStore(slug: string, ownerId: string) {
  return db.store.findFirst({
    where: { slug, ownerId },
    select: {
      id: true,
      qrisImageUrl: true,
    },
  });
}

async function getPaymentMethods(storeId: string) {
  const methods = await db.paymentMethod.findMany({
    where: { storeId },
    orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
  });

  return methods.map(serializePaymentMethod);
}

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Silakan login terlebih dahulu" }, { status: 401 });
  }

  const store = await getOwnerStore(params.slug, session.user.id);
  if (!store) {
    return NextResponse.json({ success: false, error: "Toko tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      paymentMethods: await getPaymentMethods(store.id),
      qrisImageUrl: store.qrisImageUrl,
    },
  });
}

export async function PATCH(request: Request, { params }: { params: { slug: string } }) {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Silakan login terlebih dahulu" }, { status: 401 });
  }

  const store = await getOwnerStore(params.slug, session.user.id);
  if (!store) {
    return NextResponse.json({ success: false, error: "Toko tidak ditemukan" }, { status: 404 });
  }

  const parsed = updatePaymentMethodSettingsSchema.safeParse(await request.json());
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      {
        success: false,
        error: "Data QRIS belum lengkap",
        detail: issue ? `${issue.path.join(".")}: ${issue.message}` : "Payload invalid",
      },
      { status: 400 },
    );
  }

  const qrisMethod = await db.paymentMethod.findFirst({
    where: { storeId: store.id, type: "QRIS" },
    select: { id: true },
  });

  if (!qrisMethod) {
    return NextResponse.json({ success: false, error: "Metode QRIS belum tersedia" }, { status: 404 });
  }

  const nextQrisImageUrl = parsed.data.qrisImageUrl?.trim() ? parsed.data.qrisImageUrl.trim() : null;
  const previousQrisImageUrl = store.qrisImageUrl;

  const updatedStore = await db.store.update({
    where: { id: store.id },
    data: {
      qrisImageUrl: nextQrisImageUrl,
    },
    select: {
      qrisImageUrl: true,
    },
  });

  if (
    previousQrisImageUrl &&
    previousQrisImageUrl !== updatedStore.qrisImageUrl &&
    isOwnedStoreUploadUrl(previousQrisImageUrl, store.id, "qris")
  ) {
    try {
      await del(previousQrisImageUrl);
    } catch (error) {
      console.warn("Gagal membersihkan QRIS lama", {
        storeId: store.id,
        error,
      });
    }
  } else if (previousQrisImageUrl && previousQrisImageUrl !== updatedStore.qrisImageUrl) {
    console.warn("Lewati pembersihan QRIS lama karena URL tidak aman untuk dihapus", {
      storeId: store.id,
      previousQrisImageUrl,
    });
  }

  return NextResponse.json({
    success: true,
    data: {
      qrisImageUrl: updatedStore.qrisImageUrl,
    },
  });
}
