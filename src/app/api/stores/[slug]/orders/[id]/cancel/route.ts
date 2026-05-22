import { db } from "@/lib/db";
import { getCancellationState, validateCancellation } from "@/lib/order-logic";
import { requireStaffRouteAccess, serializeOrder } from "@/lib/pos";
import { cancelOrderSchema } from "@/lib/validations/order";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { slug: string; id: string } },
) {
  const accessResult = await requireStaffRouteAccess(params.slug);
  if (!accessResult.ok) {
    return NextResponse.json({ success: false, error: accessResult.error }, { status: accessResult.status });
  }

  const parsed = cancelOrderSchema.safeParse(await request.json());
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      {
        success: false,
        error: "Alasan pembatalan wajib diisi",
        detail: issue ? `${issue.path.join(".")}: ${issue.message}` : "Payload invalid",
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

  const cancellationError = validateCancellation(order.status);
  if (cancellationError) {
    return NextResponse.json({ success: false, error: cancellationError }, { status: 409 });
  }

  const cancelledAt = new Date();
  const nextCancellation = getCancellationState(order.status, order.paidAmount, parsed.data.reason);

  const updated = await db.$transaction(async (tx) => {
    if (nextCancellation.refundAmount < 0) {
      await tx.payment.create({
        data: {
          storeId: access.storeId,
          orderId: order.id,
          paymentMethodId: order.payments.at(-1)?.paymentMethodId ?? null,
          amount: nextCancellation.refundAmount,
          status: "REFUNDED",
          paidAt: cancelledAt,
          notes: "Refund pembatalan pesanan",
        },
      });
    }

    const nextOrder = await tx.order.update({
      where: { id: order.id },
      data: {
        status: nextCancellation.status,
        cancelledAt,
        cancelReason: nextCancellation.cancelReason,
        deletedAt: cancelledAt,
        paymentStatus: nextCancellation.paymentStatus ?? order.paymentStatus,
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
        action: "order.cancelled",
        targetType: "order",
        targetId: order.id,
        details: {
          reason: nextCancellation.cancelReason,
          refundedAmount: Math.abs(nextCancellation.refundAmount),
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
