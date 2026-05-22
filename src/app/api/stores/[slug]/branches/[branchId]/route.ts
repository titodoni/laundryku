import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { normalizePhone } from "@/lib/phone";
import { updateBranchSchema } from "@/lib/validations/branch";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

async function getOwnerStore(slug: string, ownerId: string) {
  return db.store.findFirst({
    where: { slug, ownerId },
    select: { id: true },
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

export async function PATCH(
  request: Request,
  { params }: { params: { slug: string; branchId: string } },
) {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Silakan login terlebih dahulu" }, { status: 401 });
  }

  const store = await getOwnerStore(params.slug, session.user.id);
  if (!store) {
    return NextResponse.json({ success: false, error: "Toko tidak ditemukan" }, { status: 404 });
  }

  const branch = await db.branch.findFirst({
    where: {
      id: params.branchId,
      storeId: store.id,
    },
    select: {
      id: true,
      storeId: true,
    },
  });

  if (!branch) {
    return NextResponse.json({ success: false, error: "Cabang tidak ditemukan" }, { status: 404 });
  }

  const parsed = updateBranchSchema.safeParse(await request.json());
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      {
        success: false,
        error: "Data cabang belum lengkap",
        detail: issue ? `${issue.path.join(".")}: ${issue.message}` : "Payload invalid",
      },
      { status: 400 },
    );
  }

  try {
    const updatedBranch = await db.branch.update({
      where: { id: branch.id },
      data: {
        name: parsed.data.name.trim(),
        address: toNullableText(parsed.data.address),
        phone: toNullablePhone(parsed.data.phone),
        code: parsed.data.code.trim().toUpperCase(),
      },
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        code: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        branch: {
          id: updatedBranch.id,
          name: updatedBranch.name,
          address: updatedBranch.address,
          phone: updatedBranch.phone,
          code: updatedBranch.code,
          isActive: updatedBranch.isActive,
          updatedAt: updatedBranch.updatedAt.toISOString(),
        },
      },
    });
  } catch (error) {
    const maybeError = error as { code?: string };
    if (maybeError?.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          error: "Kode cabang sudah dipakai",
          detail: "code: Gunakan kode cabang lain yang masih unik di toko ini",
        },
        { status: 409 },
      );
    }

    throw error;
  }
}
