import type { OrderStatus, PaymentStatus, StaffRole, ServiceCategory, ExpenseCategory, PaymentType, PlanType, OrgStatus } from "@/types/mock-schema";

export const orderStatusLabel: Record<OrderStatus, string> = {
  RECEIVED: "Diterima", WASHING: "Dicuci", DRYING: "Dikeringkan",
  IRONING: "Disetrika", PACKING: "Packing", READY: "Siap Diambil",
  PICKED_UP: "Sudah Diambil", DELIVERED: "Diantar", CANCELLED: "Dibatalkan",
};

export const orderStatusFlow: OrderStatus[] = [
  "RECEIVED","WASHING","DRYING","IRONING","PACKING","READY","PICKED_UP"
];

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  UNPAID: "Belum Bayar", PARTIAL: "DP", PAID: "Lunas", REFUNDED: "Refund",
};

export const roleLabel: Record<StaffRole, string> = {
  ADMIN: "Admin", CASHIER: "Kasir", OPERATOR: "Operator", COURIER: "Kurir",
};

export const categoryLabel: Record<ServiceCategory, string> = {
  KILOAN: "Kiloan", SATUAN: "Satuan", EXPRESS: "Express", ADDON: "Add-on",
};

export const expenseCategoryLabel: Record<ExpenseCategory, string> = {
  ELECTRICITY: "Listrik", WATER: "Air", FRAGRANCE: "Parfum",
  PACKAGING: "Plastik", SALARY: "Gaji", OPERATIONAL: "Operasional Lain",
};

export const paymentTypeLabel: Record<PaymentType, string> = {
  CASH: "Tunai", TRANSFER: "Transfer", QRIS: "QRIS",
};

export const planLabel: Record<PlanType, string> = { FREE: "Free", PRO: "Pro" };
export const orgStatusLabel: Record<OrgStatus, string> = {
  TRIALING: "Trial", ACTIVE: "Aktif", LIMITED: "Terbatas",
  PAST_DUE: "Terlambat Bayar", CANCELLED: "Dibatalkan", EXPIRED: "Kadaluarsa",
};

export const formatIDR = (n: number) =>
  "Rp" + Math.round(n).toLocaleString("id-ID");

export const formatDateID = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

export const formatTimeID = (iso: string) =>
  new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });