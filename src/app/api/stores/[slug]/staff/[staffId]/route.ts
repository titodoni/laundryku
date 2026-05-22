import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { storeScope } from "@/lib/db-guard";
import { canAddStaff } from "@/lib/plan-guard";
import { isGeneratedStaffEmail, makeStaffPlaceholderEmail, serializeStaffMember, staffSummarySelect } from "@/lib/staff";
import { normalizePhone } from "@/lib/phone";
import { updateStaffSchema } from "@/lib/validations/staff";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

async function getOwnerStore(slug: string, ownerId: string) {
  return db.store.findFirst({
    where: { slug, ownerId },
    select: {
      id: true,
      slug: true,
    },
  });
}

async function findOwnedStaff(storeId: string, staffId: string) {
  return db.staffMember.findFirst({
    where: {
      id: staffId,
      ...storeScope(storeId),
    },
    select: {
      id: true,
      branchId: true,
      role: true,
      isActive: true,
      userId: true,
      user: {
        select: {
          id: true,
          phone: true,
          email: true,
          name: true,
        },
      },
    },
  });
}

async function getSerializedStaff(storeId: string, staffId: string) {
  const staff = await db.staffMember.findFirst({
    where: {
      id: staffId,
      ...storeScope(storeId),
    },
    select: staffSummarySelect,
  });

  return staff ? serializeStaffMember(staff) : null;
}

function getStaffLimitMessage(reason?: string) {
  if (reason?.includes("Batas 1 staf")) {
    return "Batas staf gratis tercapai. Upgrade ke Pro untuk menambah staf.";
  }

  return reason ?? "Gagal memperbarui staf";
}

export async function PATCH(request: Request, { params }: { params: { slug: string; staffId: string } }) {
  try {
    const session = await auth.api.getSession({ headers: headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const store = await getOwnerStore(params.slug, session.user.id);
    if (!store) {
      return NextResponse.json({ success: false, error: "Toko tidak ditemukan" }, { status: 404 });
    }

    const current = await findOwnedStaff(store.id, params.staffId);
    if (!current) {
      return NextResponse.json({ success: false, error: "Staf tidak ditemukan" }, { status: 404 });
    }

    const parsed = updateStaffSchema.safeParse(await request.json());
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return NextResponse.json(
        {
          success: false,
          error: "Data staf belum lengkap",
          detail: issue ? `${issue.path.join(".")}: ${issue.message}` : "Payload invalid",
        },
        { status: 400 },
      );
    }

    const input = parsed.data;
    const nextPhone = input.phone ? normalizePhone(input.phone) : current.user.phone;
    const nextBranchId = input.branchId ?? current.branchId;

    if (nextBranchId !== current.branchId) {
      const branch = await db.branch.findFirst({
        where: {
          id: nextBranchId,
          ...storeScope(store.id),
        },
        select: { id: true },
      });

      if (!branch) {
        return NextResponse.json({ success: false, error: "Cabang tidak ditemukan" }, { status: 400 });
      }
    }

    if (nextPhone) {
      const existingUser = await db.user.findUnique({
        where: { phone: nextPhone },
        select: { id: true },
      });

      if (existingUser && existingUser.id !== current.userId) {
        return NextResponse.json({ success: false, error: "Nomor HP sudah dipakai akun lain" }, { status: 409 });
      }
    }

    if (input.isActive === true && !current.isActive) {
      const guard = await canAddStaff(store.id);
      if (!guard.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: getStaffLimitMessage(guard.reason),
          },
          { status: 403 },
        );
      }
    }

    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: current.userId },
        data: {
          name: input.name?.trim() ?? current.user.name,
          phone: nextPhone,
          email:
            nextPhone && isGeneratedStaffEmail(current.user.email)
              ? makeStaffPlaceholderEmail(nextPhone, store.slug)
              : current.user.email,
        },
      });

      await tx.staffMember.update({
        where: { id: params.staffId },
        data: {
          role: input.role ?? current.role,
          branchId: nextBranchId,
          isActive: input.isActive ?? current.isActive,
        },
      });
    });

    const updated = await getSerializedStaff(store.id, params.staffId);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Staf tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        staff: updated,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal memperbarui staf";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
