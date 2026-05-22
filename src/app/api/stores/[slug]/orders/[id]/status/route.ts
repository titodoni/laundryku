import { db } from "@/lib/db";
import { requireStaffRouteAccess, serializeOrder } from "@/lib/pos";
import { isValidTransition, updateOrderStatusSchema } from "@/lib/validations/order";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: { slug: string; id: string } },
) {
  const accessResult = await requireStaffRouteAccess(params.slug);
  if (!accessResult.ok) {
    return NextResponse.json({ success: false, error: accessResult.error }, { status: accessResult.status });
  }

  const parsed = updateOrderStatusSchema.safeParse(await request.json());
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      {
        success: false,
        error: "Status pesanan tidak valid",
        detail: issue ? `${issue.path.join(".")}: ${issue.message}` : "Payload invalid",
      },
      { status: 400 },
    );
  }

  if (parsed.data.newStatus === "CANCELLED") {
    return NextResponse.json(
      {
        success: false,
        error: "Gunakan aksi batalkan pesanan untuk status dibatalkan",
      },
      { status: 400 },
    );
  }

  const access = accessResult.access;
  const order = await db.order.findFirst({
    where: {
      id: params.id,
      storeId: access.storeId,
      branchId: access.branchId,
    },
    include: {
      customer: true,
      branch: { select: { id: true, name: true } },
      items: {
        orderBy: { createdAt: "asc" },
        include: { service: { select: { id: true, name: true, category: true } } },
      },
      payments: {
        orderBy: { createdAt: "asc" },
        include: { paymentMethod: { select: { id: true, name: true, type: true } } },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ success: false, error: "Pesanan tidak ditemukan" }, { status: 404 });
  }

  if (order.deletedAt) {
    return NextResponse.json({ success: false, error: "Pesanan yang sudah dibatalkan tidak bisa diubah" }, { status: 409 });
  }

  if (!isValidTransition(order.status, parsed.data.newStatus)) {
    return NextResponse.json(
      {
        success: false,
        error: `Transisi status ${order.status} ke ${parsed.data.newStatus} tidak diperbolehkan`,
      },
      { status: 409 },
    );
  }

  const nextCompletedAt =
    parsed.data.newStatus === "PICKED_UP" || parsed.data.newStatus === "DELIVERED"
      ? new Date()
      : order.completedAt;

  const updated = await db.$transaction(async (tx) => {
    const nextOrder = await tx.order.update({
      where: { id: order.id },
      data: {
        status: parsed.data.newStatus,
        completedAt: nextCompletedAt,
      },
      include: {
        customer: true,
        branch: { select: { id: true, name: true } },
        items: {
          orderBy: { createdAt: "asc" },
          include: { service: { select: { id: true, name: true, category: true } } },
        },
        payments: {
          orderBy: { createdAt: "asc" },
          include: { paymentMethod: { select: { id: true, name: true, type: true } } },
        },
      },
    });

    await tx.activityLog.create({
      data: {
        storeId: access.storeId,
        actorType: "staff",
        actorId: access.staffId,
        actorName: access.staffName,
        action: "order.status_changed",
        targetType: "order",
        targetId: order.id,
        details: {
          previousStatus: order.status,
          nextStatus: parsed.data.newStatus,
          notes: parsed.data.notes?.trim() || null,
        },
      },
    });

    return nextOrder;
  });

  return NextResponse.json({
    success: true,
    data: {
      order: serializeOrder(updated),
    },
  });
}
