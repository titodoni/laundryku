import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
  { params }: { params: { slug: string; id: string } },
) {
  const order = await db.order.findFirst({
    where: {
      id: params.id,
      store: {
        slug: params.slug,
      },
    },
    select: {
      id: true,
      packagingLabelPrinted: true,
    },
  });

  if (!order) {
    return NextResponse.json({ success: false, error: "Pesanan tidak ditemukan" }, { status: 404 });
  }

  if (!order.packagingLabelPrinted) {
    await db.order.update({
      where: { id: order.id },
      data: {
        packagingLabelPrinted: true,
      },
    });
  }

  return NextResponse.json({
    success: true,
    data: {
      packagingLabelPrinted: true,
    },
  });
}
