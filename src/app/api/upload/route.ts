import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  MAX_UPLOAD_SIZE_BYTES,
  buildOnboardingUploadPath,
  buildStoreUploadPath,
  isUploadPurpose,
} from "@/lib/upload";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

/**
 * File upload API for logo and QRIS images.
 * Used by onboarding and owner settings. Staff-only sessions are rejected.
 */
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: headers() });
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Anda harus login terlebih dahulu." },
        { status: 401 }
      );
    }

    const actor = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        ownedStores: {
          select: { id: true, slug: true },
        },
        staffMembers: {
          select: { id: true },
          take: 1,
        },
      },
    });

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const purposeValue = String(formData.get("purpose") || "").trim();
    const slug = String(formData.get("slug") || "").trim();

    if (!purposeValue) {
      return NextResponse.json(
        { success: false, error: "Tujuan upload wajib diisi." },
        { status: 400 }
      );
    }

    if (!isUploadPurpose(purposeValue)) {
      return NextResponse.json(
        { success: false, error: "Tujuan upload tidak dikenal." },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Tidak ada file yang dikirim." },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "Hanya file gambar yang diperbolehkan." },
        { status: 400 }
      );
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: "Ukuran file terlalu besar." },
        { status: 400 }
      );
    }

    const isStaffOnly = Boolean(actor && actor.ownedStores.length === 0 && actor.staffMembers.length > 0);
    if (isStaffOnly) {
      return NextResponse.json(
        { success: false, error: "Anda tidak memiliki akses untuk upload file." },
        { status: 403 }
      );
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { success: false, error: "Server upload belum dikonfigurasi." },
        { status: 500 }
      );
    }

    let pathname: string;

    if (purposeValue === "qris" || purposeValue === "store-logo") {
      if (!slug) {
        return NextResponse.json(
          { success: false, error: "Slug toko wajib diisi." },
          { status: 400 }
        );
      }

      const store = await db.store.findFirst({
        where: {
          slug,
          ownerId: session.user.id,
        },
        select: { id: true },
      });

      if (!store) {
        return NextResponse.json(
          { success: false, error: "Akses toko ditolak." },
          { status: 403 }
        );
      }

      pathname = buildStoreUploadPath(store.id, purposeValue, file.name);
    } else {
      const alreadyOwnsStore = Boolean(actor && actor.ownedStores.length > 0);
      if (alreadyOwnsStore) {
        return NextResponse.json(
          { success: false, error: "Upload onboarding tidak tersedia untuk akun ini." },
          { status: 403 }
        );
      }

      pathname = buildOnboardingUploadPath(session.user.id, purposeValue, file.name);
    }

    const blob = await put(pathname, file, {
      access: "public",
    });

    return NextResponse.json({ success: true, data: { url: blob.url } });
  } catch {
    return NextResponse.json(
      { success: false, error: "Upload gagal. Coba lagi." },
      { status: 500 }
    );
  }
}
