import { db } from "@/lib/db";
import { getOrderPaymentState, priceOrderItem, validateOrderPayment } from "@/lib/order-logic";
import { generateOrderNumber } from "@/lib/order-number";
import { canCreateOrder } from "@/lib/plan-guard";
import {
  getOrderQueryInclude,
  getStartOfToday,
  getTomorrow,
  requireStaffRouteAccess,
  serializeOrder,
} from "@/lib/pos";
import { serializeService, serviceQueryInclude } from "@/lib/services";
import {
  createOrderSchema,
} from "@/lib/validations/order";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const accessResult = await requireStaffRouteAccess(params.slug);
  if (!accessResult.ok) {
    return NextResponse.json({ success: false, error: accessResult.error }, { status: accessResult.status });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const todayOnly = searchParams.get("today") !== "0";
  const today = getStartOfToday();
  const tomorrow = getTomorrow(today);

  const orders = await db.order.findMany({
    where: {
      storeId: accessResult.access.storeId,
      branchId: accessResult.access.branchId,
      ...(status && status !== "ALL" ? { status: status as never } : {}),
      ...(todayOnly
        ? {
            createdAt: {
              gte: today,
              lt: tomorrow,
            },
          }
        : {}),
    },
    include: getOrderQueryInclude(),
    orderBy: [{ createdAt: "desc" }],
    take: 100,
  });

  return NextResponse.json({
    success: true,
    data: {
      orders: orders.map(serializeOrder),
    },
  });
}

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  const accessResult = await requireStaffRouteAccess(params.slug);
  if (!accessResult.ok) {
    return NextResponse.json({ success: false, error: accessResult.error }, { status: accessResult.status });
  }

  const parsed = createOrderSchema.safeParse(await request.json());
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      {
        success: false,
        error: "Data pesanan belum lengkap",
        detail: issue ? `${issue.path.join(".")}: ${issue.message}` : "Payload invalid",
      },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const access = accessResult.access;

  if (input.branchId !== access.branchId) {
    return NextResponse.json({ success: false, error: "Staf hanya boleh membuat pesanan di cabangnya sendiri" }, { status: 403 });
  }

  const guard = await canCreateOrder(access.storeId);
  if (!guard.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: guard.reason ?? "Batas order harian tercapai",
      },
      { status: 422 },
    );
  }

  const paymentMethod = await db.paymentMethod.findFirst({
    where: {
      id: input.paymentMethodId,
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

  if (input.customerId) {
    const customer = await db.customer.findFirst({
      where: {
        id: input.customerId,
        storeId: access.storeId,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!customer) {
      return NextResponse.json({ success: false, error: "Pelanggan tidak ditemukan" }, { status: 404 });
    }
  }

  const requestedIds = Array.from(new Set(input.items.map((item) => item.serviceId)));
  const services = await db.service.findMany({
    where: {
      storeId: access.storeId,
      id: { in: requestedIds },
      isActive: true,
    },
    include: serviceQueryInclude,
  });

  if (services.length !== requestedIds.length) {
    return NextResponse.json({ success: false, error: "Ada layanan yang tidak tersedia untuk toko ini" }, { status: 404 });
  }

  const serializedServices = new Map(
    services.map((service) => [service.id, serializeService(service as never)]),
  );

  const pricedItems = input.items.map((item) => {
    const service = serializedServices.get(item.serviceId);
    if (!service) {
      throw new Error("Layanan tidak ditemukan");
    }

    return priceOrderItem({
      service,
      quantity: item.quantity,
      notes: item.notes?.trim() || null,
    });
  });

  const totalAmount = pricedItems.reduce((sum, item) => sum + item.subtotal, 0);
  const paymentError = validateOrderPayment(totalAmount, input.paymentType, input.paidAmount);
  if (paymentError) {
    return NextResponse.json({ success: false, error: paymentError }, { status: 400 });
  }

  const { paymentStatus, remainingAmount } = getOrderPaymentState(totalAmount, input.paymentType, input.paidAmount);
  const createdAt = new Date();
  const estimatedReadyAt = new Date(createdAt.getTime() + access.defaultSlaHours * 60 * 60 * 1000);

  try {
    const created = await db.$transaction(async (tx) => {
      const orderNumber = await generateOrderNumber(access.branchId, access.branchCode);

      const order = await tx.order.create({
        data: {
          storeId: access.storeId,
          branchId: access.branchId,
          customerId: input.customerId ?? null,
          cashierId: access.staffId,
          orderNumber,
          totalAmount,
          paidAmount: input.paidAmount,
          remainingAmount,
          notes: input.notes?.trim() || null,
          paymentStatus,
          estimatedReadyAt,
          items: {
            create: pricedItems.map((item) => ({
              serviceId: item.service.id,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.subtotal,
              notes: item.notes,
            })),
          },
          payments:
            input.paidAmount > 0
              ? {
                  create: {
                    storeId: access.storeId,
                    paymentMethodId: paymentMethod.id,
                    amount: input.paidAmount,
                    status: "PAID",
                    paidAt: createdAt,
                    notes:
                      input.paymentType === "DP"
                        ? "Pembayaran DP saat order dibuat"
                        : "Pembayaran lunas saat order dibuat",
                  },
                }
              : undefined,
        },
        include: getOrderQueryInclude(),
      });

      await tx.activityLog.create({
        data: {
          storeId: access.storeId,
          actorType: "staff",
          actorId: access.staffId,
          actorName: access.staffName,
          action: "order.created",
          targetType: "order",
          targetId: order.id,
          details: {
            orderNumber: order.orderNumber,
            totalAmount,
            paymentStatus,
          },
        },
      });

      return order;
    });

    return NextResponse.json({
      success: true,
      data: {
        order: serializeOrder(created),
        orderId: created.id,
        orderNumber: created.orderNumber,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal membuat pesanan";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
