import type {
  Organization, Branch, StaffMember, Customer, Service, PaymentMethod,
  Order, Expense, Subscription, Invoice, ActivityLog
} from "./types";

export const org: Organization = {
  id: "org_1",
  slug: "melati-clean",
  name: "Melati Clean Laundry",
  plan: "PRO",
  subscriptionStatus: "TRIALING",
  trialEndsAt: "2026-05-28T23:59:59+07:00",
  ordersTodayLimit: 10,
};

export const branches: Branch[] = [
  { id: "br_1", orgId: "org_1", name: "Cabang Pusat", address: "Jl. Melati No. 12, Bandung", phone: "0812-3456-7890" },
  { id: "br_2", orgId: "org_1", name: "Cabang Dago", address: "Jl. Dago No. 88, Bandung", phone: "0812-3456-7891" },
];

export const staff: StaffMember[] = [
  { id: "stf_1", orgId: "org_1", name: "Budi Santoso", role: "ADMIN", phone: "0812-1111-2222", active: true },
  { id: "stf_2", orgId: "org_1", name: "Siti Aminah", role: "CASHIER", phone: "0812-1111-3333", active: true },
  { id: "stf_3", orgId: "org_1", name: "Joko Pranoto", role: "OPERATOR", phone: "0812-1111-4444", active: true },
  { id: "stf_4", orgId: "org_1", name: "Rini Wahyuni", role: "CASHIER", phone: "0812-1111-5555", active: true },
  { id: "stf_5", orgId: "org_1", name: "Dedi Kurniawan", role: "COURIER", phone: "0812-1111-6666", active: false },
];

export const customers: Customer[] = [
  { id: "cus_1", orgId: "org_1", name: "Ibu Ani", phone: "0813-2222-1111", address: "Jl. Kenanga No. 5", totalOrders: 24, totalSpent: 1_250_000, lastOrderAt: "2026-05-20T10:30:00+07:00" },
  { id: "cus_2", orgId: "org_1", name: "Pak Hendra", phone: "0813-2222-2222", address: "Jl. Mawar No. 12", totalOrders: 12, totalSpent: 680_000, lastOrderAt: "2026-05-19T08:00:00+07:00" },
  { id: "cus_3", orgId: "org_1", name: "Sari Dewi", phone: "0813-2222-3333", totalOrders: 8, totalSpent: 420_000, lastOrderAt: "2026-05-18T14:00:00+07:00" },
  { id: "cus_4", orgId: "org_1", name: "Pak Agus", phone: "0813-2222-4444", address: "Jl. Anggrek No. 7", totalOrders: 36, totalSpent: 2_100_000, lastOrderAt: "2026-05-21T09:00:00+07:00" },
  { id: "cus_5", orgId: "org_1", name: "Ibu Lestari", phone: "0813-2222-5555", totalOrders: 5, totalSpent: 215_000, lastOrderAt: "2026-05-15T11:00:00+07:00" },
];

export const services: Service[] = [
  { id: "svc_1", orgId: "org_1", name: "Cuci Kering Lipat", type: "KILOAN", description: "2 hari selesai", active: true,
    price: { id: "p_1", serviceId: "svc_1", pricePerKg: 7_000, estimationHours: 48 } },
  { id: "svc_2", orgId: "org_1", name: "Cuci Kering Setrika", type: "KILOAN", description: "3 hari selesai", active: true,
    price: { id: "p_2", serviceId: "svc_2", pricePerKg: 10_000, estimationHours: 72 } },
  { id: "svc_3", orgId: "org_1", name: "Setrika Saja", type: "KILOAN", description: "1 hari selesai", active: true,
    price: { id: "p_3", serviceId: "svc_3", pricePerKg: 6_000, estimationHours: 24 } },
  { id: "svc_4", orgId: "org_1", name: "Express 6 Jam", type: "EXPRESS", description: "Selesai hari ini", active: true,
    price: { id: "p_4", serviceId: "svc_4", pricePerKg: 15_000, estimationHours: 6 } },
  { id: "svc_5", orgId: "org_1", name: "Bed Cover", type: "SATUAN", description: "Per item", active: true,
    price: { id: "p_5", serviceId: "svc_5", pricePerItem: 25_000, estimationHours: 72 } },
  { id: "svc_6", orgId: "org_1", name: "Selimut", type: "SATUAN", description: "Per item", active: true,
    price: { id: "p_6", serviceId: "svc_6", pricePerItem: 20_000, estimationHours: 72 } },
  { id: "svc_7", orgId: "org_1", name: "Parfum Premium", type: "ADDON", description: "Tambahan wangi", active: true,
    price: { id: "p_7", serviceId: "svc_7", pricePerKg: 2_000, estimationHours: 0 } },
];

export const paymentMethods: PaymentMethod[] = [
  { id: "pm_1", orgId: "org_1", channel: "CASH", label: "Tunai", active: true },
  { id: "pm_2", orgId: "org_1", channel: "TRANSFER", label: "BCA", details: "1234567890 a.n. Melati Clean", active: true },
  { id: "pm_3", orgId: "org_1", channel: "QRIS", label: "QRIS Statis", details: "QRIS Merchant Melati", active: true },
];

const mkOrder = (
  code: string, customerId: string, status: Order["status"], paymentStatus: Order["paymentStatus"],
  weightKg: number, hoursAgo: number, paid: number, svcId = "svc_2", svcName = "Cuci Kering Setrika", ppk = 10_000
): Order => {
  const subtotal = Math.round(weightKg * ppk);
  const customer = customers.find(c => c.id === customerId)!;
  const created = new Date(Date.now() - hoursAgo * 3600_000);
  const ready = new Date(created.getTime() + 72 * 3600_000);
  return {
    id: code, orgId: "org_1", branchId: "br_1", code,
    customerId, customerName: customer.name, customerPhone: customer.phone,
    items: [{
      id: code + "-1", serviceId: svcId, serviceName: svcName, serviceType: "KILOAN",
      qty: weightKg, unit: "kg", pricePerUnit: ppk, subtotal,
    }],
    subtotal, discount: 0, total: subtotal, paid,
    status, paymentStatus,
    createdAt: created.toISOString(),
    estimatedReadyAt: ready.toISOString(),
    cashierId: "stf_2", cashierName: "Siti Aminah",
    note: "",
    payments: paid > 0 ? [{ id: code + "-pay", orderId: code, channel: "CASH", amount: paid, paidAt: created.toISOString() }] : [],
  };
};

export const orders: Order[] = [
  mkOrder("MLT-260519-001", "cus_1", "WASHING", "PAID", 6.5, 3, 65_000),
  mkOrder("MLT-260521-002", "cus_2", "RECEIVED", "PARTIAL", 4, 1, 20_000, "svc_1", "Cuci Kering Lipat", 7_000),
  mkOrder("MLT-260521-003", "cus_3", "IRONING", "PAID", 3.2, 5, 32_000, "svc_3", "Setrika Saja", 6_000),
  mkOrder("MLT-260521-004", "cus_4", "READY", "PAID", 8, 24, 120_000, "svc_4", "Express 6 Jam", 15_000),
  mkOrder("MLT-260520-005", "cus_5", "PICKED_UP", "PAID", 2.5, 30, 25_000, "svc_1", "Cuci Kering Lipat", 7_000),
  mkOrder("MLT-260521-006", "cus_1", "DRYING", "UNPAID", 5, 2, 0),
  mkOrder("MLT-260521-007", "cus_4", "PACKING", "PAID", 7.5, 8, 75_000, "svc_2", "Cuci Kering Setrika", 10_000),
];

export const expenses: Expense[] = [
  { id: "exp_1", orgId: "org_1", branchId: "br_1", category: "ELECTRICITY", amount: 450_000, note: "Listrik Mei", createdAt: "2026-05-20T10:00:00+07:00" },
  { id: "exp_2", orgId: "org_1", branchId: "br_1", category: "FRAGRANCE", amount: 180_000, note: "Stok parfum", createdAt: "2026-05-19T15:00:00+07:00" },
  { id: "exp_3", orgId: "org_1", branchId: "br_1", category: "PACKAGING", amount: 220_000, note: "Plastik kemasan", createdAt: "2026-05-18T09:00:00+07:00" },
  { id: "exp_4", orgId: "org_1", branchId: "br_1", category: "SALARY", amount: 2_500_000, note: "Gaji Siti", createdAt: "2026-05-15T08:00:00+07:00" },
  { id: "exp_5", orgId: "org_1", branchId: "br_1", category: "WATER", amount: 175_000, note: "Air PDAM", createdAt: "2026-05-14T10:00:00+07:00" },
];

export const subscription: Subscription = {
  plan: "PRO", status: "TRIALING",
  trialEndsAt: "2026-05-28T23:59:59+07:00",
  renewsAt: "2026-06-28T00:00:00+07:00",
  pricePerMonth: 149_000,
};

export const invoices: Invoice[] = [
  { id: "inv_1", number: "INV-2026-0521", periodStart: "2026-05-01", periodEnd: "2026-05-31", amount: 149_000, status: "PENDING" },
  { id: "inv_2", number: "INV-2026-0421", periodStart: "2026-04-01", periodEnd: "2026-04-30", amount: 149_000, status: "PAID" },
  { id: "inv_3", number: "INV-2026-0321", periodStart: "2026-03-01", periodEnd: "2026-03-31", amount: 149_000, status: "PAID" },
];

export const activityLogs: ActivityLog[] = [
  { id: "log_1", actor: "Siti Aminah", action: "Membuat pesanan MLT-260521-007", createdAt: new Date(Date.now() - 8 * 3600_000).toISOString() },
  { id: "log_2", actor: "Joko Pranoto", action: "Mengubah status MLT-260521-003 menjadi Disetrika", createdAt: new Date(Date.now() - 5 * 3600_000).toISOString() },
  { id: "log_3", actor: "Budi Santoso", action: "Menambahkan biaya Listrik Rp450.000", createdAt: new Date(Date.now() - 26 * 3600_000).toISOString() },
  { id: "log_4", actor: "Siti Aminah", action: "Menerima pembayaran MLT-260521-004", createdAt: new Date(Date.now() - 24 * 3600_000).toISOString() },
];

// Aggregates
export const todayIncome = orders.filter(o => Date.now() - new Date(o.createdAt).getTime() < 86400_000).reduce((s, o) => s + o.paid, 0);
export const todayExpense = 0;
export const todayOrdersCount = orders.filter(o => Date.now() - new Date(o.createdAt).getTime() < 86400_000).length;
export const todayWeight = orders.filter(o => Date.now() - new Date(o.createdAt).getTime() < 86400_000)
  .reduce((s, o) => s + o.items.reduce((a, i) => a + (i.unit === "kg" ? i.qty : 0), 0), 0);
