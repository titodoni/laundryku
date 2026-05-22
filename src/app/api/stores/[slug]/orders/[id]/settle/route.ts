import { db } from "@/lib/db";
import { getSettlementState, validateSettlement } from "@/lib/order-logic";
import { requireStaffRouteAccess, serializeOrder } from "@/lib/pos";
import { settleOrderSchema } from "@/lib/validations/order";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { slug: string; id: string } },
) {
  const accessResult = await requireStaffRouteAccess(params.slug);
  if (!accessResult.ok) {
    return NextResponse.json({ success: false, error: accessResult.error }, { status: accessResult.status });
  }

  const parsed = settleOrderSchema.safeParse(await request.json());
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      {
        success: false,
        error: "Data pelunasan tidak valid",
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

  const settlementError = validateSettlement(order.paymentStatus, order.remainingAmount, parsed.data.amount);
  if (settlementError) {
    return NextResponse.json(
      { success: false, error: settlementError },
      { status: settlementError.includes("Hanya pesanan DP") ? 409 : 400 },
    );
  }

  const paymentMethod = await db.paymentMethod.findFirst({
    where: {
      id: parsed.data.paymentMethodId,
      storeId: access.storeId,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (!paymentMethod) {
    return NextResponse.json({ success: false, error: "Metode pembayaran tidak ditemukan" }, { status: 404 });
  }

  const settledAt = new Date();
  const nextSettlement = getSettlementState(order.paidAmount, order.remainingAmount);

  const updated = await db.$transaction(async (tx) => {
    await tx.payment.create({
      data: {
        storeId: access.storeId,
        orderId: order.id,
        paymentMethodId: paymentMethod.id,
        amount: order.remainingAmount,
        status: "PAID",
        paidAt: settledAt,
        notes: "Pelunasan DP",
      },
    });

    const nextOrder = await tx.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: nextSettlement.paymentStatus,
        paidAmount: nextSettlement.paidAmount,
        remainingAmount: nextSettlement.remainingAmount,
        settledAt,
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
        action: "payment.settled",
        targetType: "order",
        targetId: order.id,
        details: {
          settledAmount: order.remainingAmount,
          paymentMethodName: paymentMethod.name,
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
