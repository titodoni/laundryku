import type { OrderStatus, PaymentStatus, PaymentChannel, Role, ServiceType, ExpenseCategory, Plan, SubscriptionStatus, InvoiceStatus } from "@/mocks/types";

export const orderStatusLabel: Record<OrderStatus, string> = {
  RECEIVED: "Diterima",
  WASHING: "Dicuci",
  DRYING: "Dikeringkan",
  IRONING: "Disetrika",
  PACKING: "Dikemas",
  READY: "Siap Diambil",
  PICKED_UP: "Sudah Diambil",
  DELIVERED: "Diantar",
};

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  UNPAID: "Belum Bayar",
  PARTIAL: "DP",
  PAID: "Lunas",
  REFUNDED: "Refund",
};

export const paymentChannelLabel: Record<PaymentChannel, string> = {
  CASH: "Tunai",
  TRANSFER: "Transfer",
  QRIS: "QRIS",
};

export const roleLabel: Record<Role, string> = {
  ADMIN: "Owner",
  CASHIER: "Kasir",
  OPERATOR: "Operator",
  COURIER: "Kurir",
};

export const serviceTypeLabel: Record<ServiceType, string> = {
  KILOAN: "Kiloan",
  SATUAN: "Satuan",
  EXPRESS: "Express",
  ADDON: "Tambahan",
};

export const expenseCategoryLabel: Record<ExpenseCategory, string> = {
  ELECTRICITY: "Listrik",
  WATER: "Air",
  FRAGRANCE: "Parfum",
  PACKAGING: "Kemasan",
  SALARY: "Gaji",
  OPERATIONAL: "Operasional",
};

export const planLabel: Record<Plan, string> = { FREE: "Free", PRO: "Pro" };

export const subscriptionStatusLabel: Record<SubscriptionStatus, string> = {
  TRIALING: "Masa Uji Coba",
  ACTIVE: "Aktif",
  LIMITED: "Terbatas",
  PAST_DUE: "Tertunda",
  CANCELLED: "Dibatalkan",
  EXPIRED: "Kedaluwarsa",
};

export const invoiceStatusLabel: Record<InvoiceStatus, string> = {
  PENDING: "Menunggu",
  PAID: "Lunas",
  FAILED: "Gagal",
};

export const ORDER_FLOW: OrderStatus[] = ["RECEIVED", "WASHING", "DRYING", "IRONING", "PACKING", "READY", "PICKED_UP"];
