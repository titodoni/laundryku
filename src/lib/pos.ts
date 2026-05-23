import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { normalizeOrderStatus, orderStatusLabels, type OrderLifecycleStatus } from "@/lib/order-status";
import { serializePaymentMethod, type PaymentMethodSummary } from "@/lib/payment-methods";
import {
  formatIDR,
  getServiceDisplayPrice,
  serializeService,
  serviceQueryInclude,
  type ServiceSummary,
} from "@/lib/services";
import { headers } from "next/headers";
import type { Prisma } from "@prisma/client";

export const paymentStatusLabels: Record<string, string> = {
  UNPAID: "Belum Bayar",
  PARTIAL: "DP",
  PAID: "Lunas",
  REFUNDED: "Refund",
};

export type StaffStoreAccess = {
  storeId: string;
  storeName: string;
  storeQrisImageUrl: string | null;
  defaultSlaHours: number;
  branchId: string;
  branchName: string;
  branchCode: string;
  staffId: string;
  staffUserId: string;
  staffName: string;
  staffRole: "CASHIER" | "OPERATOR" | "COURIER";
};

export type CustomerSummary = {
  id: string;
  name: string;
  phone: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OrderSummary = {
  id: string;
  orderNumber: string;
  status: OrderLifecycleStatus;
  statusLabel: string;
  paymentStatus: string;
  paymentStatusLabel: string;
  totalAmount: number;
  totalAmountLabel: string;
  paidAmount: number;
  paidAmountLabel: string;
  remainingAmount: number;
  remainingAmountLabel: string;
  notes: string | null;
  estimatedReadyAt: string | null;
  completedAt: string | null;
  packagingLabelPrinted: boolean;
  cancelledAt: string | null;
  cancelReason: string | null;
  settledAt: string | null;
  createdAt: string;
  updatedAt: string;
  branchId: string;
  branchName: string;
  customerId: string | null;
  customerName: string;
  customerPhone: string | null;
  itemSummary: string;
  paymentMethodName: string | null;
  items: Array<{
    id: string;
    serviceId: string;
    serviceName: string;
    category: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    notes: string | null;
  }>;
};

type StaffRouteContext =
  | { ok: true; access: StaffStoreAccess }
  | { ok: false; status: number; error: string };

const orderQueryInclude = {
  customer: true,
  branch: {
    select: {
      id: true,
      name: true,
    },
  },
  items: {
    orderBy: {
      createdAt: "asc",
    },
    include: {
      service: {
        select: {
          id: true,
          name: true,
          category: true,
        },
      },
    },
  },
  payments: {
    orderBy: {
      createdAt: "asc",
    },
    include: {
      paymentMethod: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
    },
  },
} satisfies Prisma.OrderInclude;

export type OrderRecord = Prisma.OrderGetPayload<{
  include: typeof orderQueryInclude;
}>;

export async function requireStaffRouteAccess(slug: string): Promise<StaffRouteContext> {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session?.user?.id) {
    if (process.env.NODE_ENV === "development") {
      console.log("[pos-auth] no session for slug", slug);
    }
    return { ok: false, status: 401, error: "Silakan login terlebih dahulu" };
  }

  const staff = await db.staffMember.findFirst({
    where: {
      userId: session.user.id,
      isActive: true,
      store: { slug },
    },
    select: {
      id: true,
      role: true,
      userId: true,
      user: {
        select: {
          name: true,
        },
      },
      branch: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      store: {
        select: {
          id: true,
          name: true,
          qrisImageUrl: true,
          defaultSlaHours: true,
        },
      },
    },
  });

  if (!staff) {
    if (process.env.NODE_ENV === "development") {
      const staffAssignments = await db.staffMember.findMany({
        where: {
          userId: session.user.id,
        },
        select: {
          id: true,
          isActive: true,
          store: {
            select: {
              slug: true,
            },
          },
          branch: {
            select: {
              id: true,
              isActive: true,
            },
          },
        },
      });
      const sameStoreAssignments = staffAssignments.filter((assignment) => assignment.store.slug === slug);
      const debugReason =
        staffAssignments.length === 0
          ? "no-staff-for-session-user"
          : sameStoreAssignments.length === 0
            ? "staff-linked-to-different-store"
            : sameStoreAssignments.every((assignment) => !assignment.isActive)
              ? "staff-in-store-inactive"
              : sameStoreAssignments.every((assignment) => !assignment.branch.isActive)
                ? "staff-branch-inactive"
                : "staff-access-mismatch";
      console.log("[pos-auth] no active staff access", {
        slug,
        userId: session.user.id,
        reason: debugReason,
        assignments: staffAssignments.map((assignment) => ({
          id: assignment.id,
          storeSlug: assignment.store.slug,
          isActive: assignment.isActive,
          branchId: assignment.branch.id,
          branchIsActive: assignment.branch.isActive,
        })),
      });
    }
    return { ok: false, status: 404, error: "Akses staf tidak ditemukan" };
  }

  return {
    ok: true,
    access: {
      storeId: staff.store.id,
      storeName: staff.store.name,
      storeQrisImageUrl: staff.store.qrisImageUrl,
      defaultSlaHours: staff.store.defaultSlaHours,
      branchId: staff.branch.id,
      branchName: staff.branch.name,
      branchCode: staff.branch.code,
      staffId: staff.id,
      staffUserId: staff.userId,
      staffName: staff.user.name,
      staffRole: staff.role,
    },
  };
}

export async function getPosBootstrap(access: StaffStoreAccess) {
  const [services, paymentMethods] = await Promise.all([
    db.service.findMany({
      where: {
        storeId: access.storeId,
        isActive: true,
      },
      include: serviceQueryInclude,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    db.paymentMethod.findMany({
      where: {
        storeId: access.storeId,
        isActive: true,
      },
      orderBy: [{ createdAt: "asc" }],
    }),
  ]);

  return {
    services: services.map((service) => serializeService(service as never)),
    paymentMethods: paymentMethods.map(serializePaymentMethod),
  };
}

export function serializeCustomer(customer: {
  id: string;
  name: string;
  phone: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}): CustomerSummary {
  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    notes: customer.notes,
    createdAt: customer.createdAt.toISOString(),
    updatedAt: customer.updatedAt.toISOString(),
  };
}

export function serializeOrder(order: OrderRecord): OrderSummary {
  const normalizedStatus = normalizeOrderStatus(order.status);
  const itemSummary = order.items
    .map((item) => {
      const quantityLabel =
        item.service.category === "KILOAN" || item.service.category === "EXPRESS"
          ? `${(item.quantity / 1000).toFixed(1)}kg`
          : `${item.quantity}x`;
      return `${item.service.name} ${quantityLabel}`;
    })
    .join(", ");

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: normalizedStatus,
    statusLabel: orderStatusLabels[normalizedStatus] ?? normalizedStatus,
    paymentStatus: order.paymentStatus,
    paymentStatusLabel: paymentStatusLabels[order.paymentStatus] ?? order.paymentStatus,
    totalAmount: order.totalAmount,
    totalAmountLabel: formatIDR(order.totalAmount),
    paidAmount: order.paidAmount,
    paidAmountLabel: formatIDR(order.paidAmount),
    remainingAmount: order.remainingAmount,
    remainingAmountLabel: formatIDR(order.remainingAmount),
    notes: order.notes,
    estimatedReadyAt: order.estimatedReadyAt?.toISOString() ?? null,
    completedAt: order.completedAt?.toISOString() ?? null,
    packagingLabelPrinted: order.packagingLabelPrinted,
    cancelledAt: order.cancelledAt?.toISOString() ?? null,
    cancelReason: order.cancelReason,
    settledAt: order.settledAt?.toISOString() ?? null,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    branchId: order.branchId,
    branchName: order.branch.name,
    customerId: order.customerId,
    customerName: order.customer?.name ?? "Pelanggan Umum",
    customerPhone: order.customer?.phone ?? null,
    itemSummary,
    paymentMethodName: order.payments.at(-1)?.paymentMethod?.name ?? null,
    items: order.items.map((item) => ({
      id: item.id,
      serviceId: item.serviceId,
      serviceName: item.service.name,
      category: item.service.category,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
      notes: item.notes ?? null,
    })),
  };
}

export function getServiceUnitPrice(service: ServiceSummary) {
  return getServiceDisplayPrice(service);
}

export function getStartOfToday() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return start;
}

export function getTomorrow(start = getStartOfToday()) {
  const tomorrow = new Date(start);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
}

export function getOrderQueryInclude() {
  return orderQueryInclude;
}
