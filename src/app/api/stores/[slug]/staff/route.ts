import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { storeScope } from "@/lib/db-guard";
import {
  FREE_STAFF_LIMIT,
  makeStaffPlaceholderEmail,
  serializeStaffMember,
  staffSummarySelect,
} from "@/lib/staff";
import { normalizePhone } from "@/lib/phone";
import { canAddStaff, canAddStaffFromSnapshot } from "@/lib/plan-guard";
import { createStaffSchema } from "@/lib/validations/staff";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

async function getOwnerStore(slug: string, ownerId: string) {
  return db.store.findFirst({
    where: { slug, ownerId },
    select: {
      id: true,
      slug: true,
      subscription: {
        select: {
          planType: true,
          status: true,
          trialEndsAt: true,
        },
      },
    },
  });
}

async function getBranches(storeId: string) {
  return db.branch.findMany({
    where: storeScope(storeId),
    orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      isActive: true,
    },
  });
}

async function getStaffCollection(storeId: string) {
  const staff = await db.staffMember.findMany({
    where: storeScope(storeId),
    orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
    select: staffSummarySelect,
  });

  return staff.map(serializeStaffMember);
}

async function getStaffByUserId(storeId: string, userId: string) {
  const staff = await db.staffMember.findFirst({
    where: {
      userId,
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

  return reason ?? "Gagal menambah staf";
}

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  try {
    const session = await auth.api.getSession({ headers: headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const store = await getOwnerStore(params.slug, session.user.id);
    if (!store) {
      return NextResponse.json({ success: false, error: "Toko tidak ditemukan" }, { status: 404 });
    }

    const [staff, branches, activeStaffCount] = await Promise.all([
      getStaffCollection(store.id),
      getBranches(store.id),
      db.staffMember.count({ where: { ...storeScope(store.id), isActive: true } }),
    ]);

    const guard = canAddStaffFromSnapshot(store.subscription ?? null, activeStaffCount);

    const limitReached = Boolean(!guard.allowed && guard.reason?.includes("Batas 1 staf"));

    return NextResponse.json({
      success: true,
      data: {
        staff,
        branches,
        meta: {
          activeStaffCount,
          freeStaffLimit: FREE_STAFF_LIMIT,
          canAddStaff: guard.allowed,
          limitReached,
          limitMessage: limitReached
            ? "Batas staf gratis tercapai. Upgrade ke Pro untuk menambah staf."
            : guard.allowed
              ? null
              : guard.reason ?? null,
          subscription: store.subscription,
        },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal memuat data staf";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  try {
    const session = await auth.api.getSession({ headers: headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const store = await getOwnerStore(params.slug, session.user.id);
    if (!store) {
      return NextResponse.json({ success: false, error: "Toko tidak ditemukan" }, { status: 404 });
    }

    const parsed = createStaffSchema.safeParse(await request.json());
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

    const input = parsed.data;
    const phone = normalizePhone(input.phone);
    const pinHash = await bcrypt.hash(input.pin, 12);

    const branch = await db.branch.findFirst({
      where: {
        id: input.branchId,
        ...storeScope(store.id),
      },
      select: { id: true },
    });

    if (!branch) {
      return NextResponse.json({ success: false, error: "Cabang tidak ditemukan" }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({
      where: { phone },
      select: {
        id: true,
        staffMembers: {
          select: {
            storeId: true,
          },
        },
      },
    });

    if (existingUser) {
      const belongsToThisStore = existingUser.staffMembers.some((staff) => staff.storeId === store.id);
      if (belongsToThisStore) {
        return NextResponse.json({ success: false, error: "Nomor HP staf sudah terdaftar" }, { status: 409 });
      }

      return NextResponse.json(
        {
          success: false,
          error: "Nomor HP sudah dipakai akun lain",
        },
        { status: 409 },
      );
    }

    const created = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: input.name.trim(),
          email: makeStaffPlaceholderEmail(phone, store.slug),
          phone,
          emailVerified: true,
        },
        select: {
          id: true,
        },
      });

      await tx.staffMember.create({
        data: {
          userId: user.id,
          storeId: store.id,
          branchId: branch.id,
          role: input.role,
          isActive: true,
          pinHash,
        },
      });

      return {
        userId: user.id,
      };
    });

    const staff = await getStaffByUserId(store.id, created.userId);
    if (!staff) {
      return NextResponse.json({ success: false, error: "Staf gagal dibuat" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        staff,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menambah staf";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
