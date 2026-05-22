import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

async function getOwnerStore(slug: string, ownerId: string) {
  return db.store.findFirst({
    where: { slug, ownerId },
    select: { id: true },
  });
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

  const branches = await db.branch.findMany({
    where: { storeId: store.id },
    orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      address: true,
      phone: true,
      code: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({
    success: true,
    data: {
      branches: branches.map((branch) => ({
        id: branch.id,
        name: branch.name,
        address: branch.address,
        phone: branch.phone,
        code: branch.code,
        isActive: branch.isActive,
        createdAt: branch.createdAt.toISOString(),
        updatedAt: branch.updatedAt.toISOString(),
      })),
    },
  });
}
