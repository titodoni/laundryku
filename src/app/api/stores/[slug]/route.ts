import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isOwnedStoreUploadUrl } from "@/lib/upload";
import { normalizePhone } from "@/lib/phone";
import { updateStoreProfileSchema } from "@/lib/validations/store";
import { del } from "@vercel/blob";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

async function getOwnerStore(slug: string, ownerId: string) {
  return db.store.findFirst({
    where: { slug, ownerId },
    select: {
      id: true,
      name: true,
      slug: true,
      phone: true,
      whatsappPhone: true,
      address: true,
      logoUrl: true,
      defaultSlaHours: true,
    },
  });
}

function toNullablePhone(value: string | undefined) {
  const trimmed = value?.trim() ?? "";
  return trimmed ? normalizePhone(trimmed) : null;
}

function toNullableText(value: string | undefined) {
  const trimmed = value?.trim() ?? "";
  return trimmed || null;
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

  const parsed = updateStoreProfileSchema.safeParse(await request.json());
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      {
        success: false,
        error: "Data toko belum lengkap",
        detail: issue ? `${issue.path.join(".")}: ${issue.message}` : "Payload invalid",
      },
      { status: 400 },
    );
  }

  const nextLogoUrl = parsed.data.logoUrl?.trim() ? parsed.data.logoUrl.trim() : null;
  const previousLogoUrl = store.logoUrl;

  const updatedStore = await db.store.update({
    where: { id: store.id },
    data: {
      name: parsed.data.name.trim(),
      phone: toNullablePhone(parsed.data.phone),
      whatsappPhone: toNullablePhone(parsed.data.whatsappPhone),
      address: toNullableText(parsed.data.address),
      defaultSlaHours: parsed.data.defaultSlaHours,
      logoUrl: nextLogoUrl,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      phone: true,
      whatsappPhone: true,
      address: true,
      logoUrl: true,
      defaultSlaHours: true,
      updatedAt: true,
    },
  });

  if (
    nextLogoUrl &&
    previousLogoUrl &&
    previousLogoUrl !== updatedStore.logoUrl &&
    isOwnedStoreUploadUrl(previousLogoUrl, store.id, "store-logo")
  ) {
    try {
      await del(previousLogoUrl);
    } catch (error) {
      console.warn("Gagal membersihkan logo toko lama", {
        storeId: store.id,
        error,
      });
    }
  } else if (nextLogoUrl && previousLogoUrl && previousLogoUrl !== updatedStore.logoUrl) {
    console.warn("Lewati pembersihan logo lama karena URL tidak aman untuk dihapus", {
      storeId: store.id,
      previousLogoUrl,
    });
  }

  return NextResponse.json({
    success: true,
    data: {
      store: {
        id: updatedStore.id,
        name: updatedStore.name,
        slug: updatedStore.slug,
        phone: updatedStore.phone,
        whatsappPhone: updatedStore.whatsappPhone,
        address: updatedStore.address,
        logoUrl: updatedStore.logoUrl,
        defaultSlaHours: updatedStore.defaultSlaHours,
        updatedAt: updatedStore.updatedAt.toISOString(),
      },
    },
  });
}
