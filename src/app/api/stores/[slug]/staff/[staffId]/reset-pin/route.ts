import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { storeScope } from "@/lib/db-guard";
import { resetStaffPinSchema } from "@/lib/validations/staff";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

async function getOwnerStore(slug: string, ownerId: string) {
  return db.store.findFirst({
    where: { slug, ownerId },
    select: { id: true },
  });
}

export async function POST(request: Request, { params }: { params: { slug: string; staffId: string } }) {
  try {
    const session = await auth.api.getSession({ headers: headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const store = await getOwnerStore(params.slug, session.user.id);
    if (!store) {
      return NextResponse.json({ success: false, error: "Toko tidak ditemukan" }, { status: 404 });
    }

    const staff = await db.staffMember.findFirst({
      where: {
        id: params.staffId,
        ...storeScope(store.id),
      },
      select: {
        id: true,
      },
    });

    if (!staff) {
      return NextResponse.json({ success: false, error: "Staf tidak ditemukan" }, { status: 404 });
    }

    const parsed = resetStaffPinSchema.safeParse(await request.json());
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return NextResponse.json(
        {
          success: false,
          error: "PIN baru tidak valid",
          detail: issue ? `${issue.path.join(".")}: ${issue.message}` : "Payload invalid",
        },
        { status: 400 },
      );
    }

    await db.staffMember.update({
      where: { id: params.staffId },
      data: {
        pinHash: await bcrypt.hash(parsed.data.pin, 12),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        staffId: params.staffId,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mereset PIN";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
