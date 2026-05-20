import { put, del } from "@vercel/blob";
import { NextResponse } from "next/server";

/**
 * File upload API for logo and QRIS images.
 * CRITICAL: put() new blob BEFORE del() old blob to prevent data loss.
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const oldUrl = formData.get("oldUrl") as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File too large (max 2MB)" },
        { status: 400 }
      );
    }

    // 1. Upload new file FIRST
    const blob = await put(file.name, file, {
      access: "public",
    });

    // 2. Delete old file ONLY after successful upload
    if (oldUrl) {
      try {
        await del(oldUrl);
      } catch {
        // Best-effort cleanup; don't fail the request if old blob is already gone
      }
    }

    return NextResponse.json({ success: true, data: { url: blob.url } });
  } catch {
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    );
  }
}
