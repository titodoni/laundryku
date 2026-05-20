import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { normalizePhone } from "@/lib/phone";
import { checkPinAttempt, incrementPinAttempt, clearPinAttempts } from "@/lib/rate-limit";
import { createStaffSession } from "@/lib/auth";

/**
 * Custom staff PIN login — tenant-scoped under /api/stores/[slug]/staff-login
 * Uses StaffMember.pinHash (NOT Account.password) for bcrypt comparison.
 */
export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await request.json();
    const { phone: rawPhone, pin } = body;

    // 1. Find store by slug
    const store = await db.store.findUnique({
      where: { slug },
      include: { branches: true },
    });

    if (!store) {
      return NextResponse.json(
        { success: false, error: "Toko tidak ditemukan" },
        { status: 404 }
      );
    }

    // 2. Normalize phone
    const phone = normalizePhone(rawPhone);

    // 3. Find staff member by phone + store
    const staff = await db.staffMember.findFirst({
      where: { storeId: store.id, user: { phone } },
      include: { user: true, branch: true },
    });

    if (!staff || !staff.pinHash) {
      return NextResponse.json(
        { success: false, error: "Nomor HP atau PIN salah" },
        { status: 401 }
      );
    }

    // 4. Check rate limit (PinAttempt table + Upstash)
    const rateLimitCheck = await checkPinAttempt(phone, staff.branchId);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { success: false, error: rateLimitCheck.reason },
        { status: 429 }
      );
    }

    // 5. Verify PIN against StaffMember.pinHash
    const valid = await bcrypt.compare(pin, staff.pinHash);
    if (!valid) {
      await incrementPinAttempt(phone, staff.branchId);
      return NextResponse.json(
        { success: false, error: "Nomor HP atau PIN salah" },
        { status: 401 }
      );
    }

    // 6. Create Better Auth session manually
    const session = await createStaffSession(staff.userId);

    // 7. Clear attempts on success
    await clearPinAttempts(phone, staff.branchId);

    return NextResponse.json({
      success: true,
      data: {
        sessionToken: session.token,
        user: {
          id: staff.userId,
          name: staff.user.name,
          role: staff.role,
          branchId: staff.branchId,
        },
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Login gagal" },
      { status: 500 }
    );
  }
}
