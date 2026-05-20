import type {
  Organization, Branch, StaffMember, Customer, Service, PaymentMethod,
  Order, Expense, Subscription, Invoice, ActivityLog
} from "@/types/mock-schema";

export const organizations: Organization[] = [
  { id: "org_1", slug: "laundry-melati", name: "Laundry Melati", phone: "0812-3456-7890",
    address: "Jl. Melati No. 12, Malang", plan: "FREE", status: "TRIALING",
    trialEndsAt: "2026-05-26T00:00:00Z" },
  { id: "org_2", slug: "kinclong-laundry", name: "Kinclong Laundry", phone: "0821-1111-2222",
    address: "Jl. Sudirman No. 45, Surabaya", plan: "PRO", status: "ACTIVE" },
  { id: "org_3", slug: "bersih-cepat", name: "Bersih Cepat", phone: "0813-9999-8888",
    address: "Jl. Diponegoro No. 7, Bandung", plan: "FREE", status: "LIMITED" },
];

export const currentOrg = organizations[0];

export const branches: Branch[] = [
  { id: "br_1", orgId: "org_1", name: "Cabang Pusat", code: "MLT", address: "Jl. Melati No. 12, Malang", phone: "0341-111222" },
];

export const staffMembers: StaffMember[] = [
  { id: "st_1", orgId: "org_1", branchId: "br_1", name: "Siti Aminah", phone: "0812-1111-1111", role: "CASHIER", active: true, lastActive: "2026-05-20T08:30:00Z", pinSet: true },
  { id: "st_2", orgId: "org_1", branchId: "br_1", name: "Budi Santoso", phone: "0812-2222-2222", role: "OPERATOR", active: true, lastActive: "2026-05-20T07:10:00Z", pinSet: true },
  { id: "st_3", orgId: "org_1", branchId: "br_1", name: "Andi Pratama", phone: "0812-3333-3333", role: "COURIER", active: false, lastActive: "2026-05-15T16:00:00Z", pinSet: true },
];

export const customers: Customer[] = [
  { id: "c_1", orgId: "org_1", name: "Ibu Rina", phone: "0812-7777-1111", totalOrders: 24, lastOrderAt: "2026-05-19T10:00:00Z", tags: ["Langganan"] },
  { id: "c_2", orgId: "org_1", name: "Pak Joko", phone: "0813-7777-2222", totalOrders: 12, lastOrderAt: "2026-05-18T09:00:00Z" },
  { id: "c_3", orgId: "org_1", name: "Mbak Sari", phone: "0856-7777-3333", totalOrders: 5, lastOrderAt: "2026-05-15T14:00:00Z" },
  { id: "c_4", orgId: "org_1", name: "Pelanggan Umum", phone: "-", totalOrders: 1 },
];

export const services: Service[] = [
  { id: "sv_1", orgId: "org_1", name: "Cuci Kering Lipat", category: "KILOAN", price: 7000, unit: "kg", minQty: 3, active: true },
  { id: "sv_2", orgId: "org_1", name: "Cuci Setrika", category: "KILOAN", price: 10000, unit: "kg", minQty: 3, active: true },
  { id: "sv_3", orgId: "org_1", name: "Setrika Saja", category: "KILOAN", price: 6000, unit: "kg", minQty: 3, active: true },
  { id: "sv_4", orgId: "org_1", name: "Bed Cover", category: "SATUAN", price: 25000, unit: "pcs", minQty: 1, active: true },
  { id: "sv_5", orgId: "org_1", name: "Selimut", category: "SATUAN", price: 18000, unit: "pcs", minQty: 1, active: true },
  { id: "sv_6", orgId: "org_1", name: "Boneka Besar", category: "SATUAN", price: 30000, unit: "pcs", minQty: 1, active: true },
  { id: "sv_7", orgId: "org_1", name: "Express 6 Jam", category: "EXPRESS", price: 15000, unit: "kg", minQty: 3, active: true },
  { id: "sv_8", orgId: "org_1", name: "Parfum Premium", category: "ADDON", price: 3000, unit: "kg", minQty: 1, active: true },
];

export const paymentMethods: PaymentMethod[] = [
  { id: "pm_1", orgId: "org_1", type: "CASH", displayName: "Tunai", active: true },
  { id: "pm_2", orgId: "org_1", type: "TRANSFER", displayName: "Transfer BCA", active: true },
  { id: "pm_3", orgId: "org_1", type: "QRIS", displayName: "QRIS", active: true, qrisImageUrl: "/placeholder.svg" },
];

const mkOrder = (
  seq: number, status: Order["status"], paymentStatus: Order["paymentStatus"],
  customerId: string, total: number, paid: number, hoursAgo = 2
): Order => {
  const created = new Date(Date.now() - hoursAgo * 3600_000);
  const number = `MLT-${created.toISOString().slice(2,10).replace(/-/g,"")}-${String(seq).padStart(3,"0")}`;
  return {
    id: `o_${seq}`, orgId: "org_1", branchId: "br_1",
    orderNumber: number, orderCode: `TRK${1000+seq}`,
    customerId, cashierId: "st_1",
    items: [
      { serviceId: "sv_2", name: "Cuci Setrika", qty: 4, unit: "kg", price: 10000, subtotal: 40000 },
    ],
    total, paid, remaining: total - paid, status, paymentStatus,
    createdAt: created.toISOString(),
    estimatedReadyAt: new Date(created.getTime() + 48*3600_000).toISOString(),
  };
};

export const orders: Order[] = [
  mkOrder(1, "RECEIVED", "PARTIAL", "c_1", 40000, 20000, 1),
  mkOrder(2, "WASHING", "PAID", "c_2", 35000, 35000, 3),
  mkOrder(3, "DRYING", "PAID", "c_3", 70000, 70000, 5),
  mkOrder(4, "IRONING", "UNPAID", "c_1", 50000, 0, 8),
  mkOrder(5, "PACKING", "PAID", "c_2", 60000, 60000, 10),
  mkOrder(6, "READY", "PARTIAL", "c_3", 80000, 30000, 24),
  mkOrder(7, "PICKED_UP", "PAID", "c_1", 45000, 45000, 30),
  mkOrder(8, "DELIVERED", "PAID", "c_2", 90000, 90000, 36),
  mkOrder(9, "CANCELLED", "REFUNDED", "c_3", 25000, 0, 48),
];

export const expenses: Expense[] = [
  { id: "e_1", orgId: "org_1", branchId: "br_1", date: "2026-05-20", category: "ELECTRICITY", amount: 250000, notes: "PLN Mei" },
  { id: "e_2", orgId: "org_1", branchId: "br_1", date: "2026-05-20", category: "FRAGRANCE", amount: 80000 },
  { id: "e_3", orgId: "org_1", branchId: "br_1", date: "2026-05-19", category: "PACKAGING", amount: 120000, notes: "Plastik HD 1pack" },
  { id: "e_4", orgId: "org_1", branchId: "br_1", date: "2026-05-18", category: "SALARY", amount: 1500000, notes: "Gaji Siti" },
  { id: "e_5", orgId: "org_1", branchId: "br_1", date: "2026-05-17", category: "WATER", amount: 90000 },
];

export const subscription: Subscription = {
  id: "sub_1", orgId: "org_1", plan: "FREE", status: "TRIALING",
  trialEndsAt: "2026-05-26T00:00:00Z",
};

export const invoices: Invoice[] = [
  { id: "inv_1", orgId: "org_1", number: "INV-2026-0001", amount: 65000, status: "PAID", issuedAt: "2026-04-20", paidAt: "2026-04-20" },
  { id: "inv_2", orgId: "org_1", number: "INV-2026-0002", amount: 65000, status: "PENDING", issuedAt: "2026-05-20" },
];

export const activityLogs: ActivityLog[] = [
  { id: "al_1", actor: "Siti Aminah", action: "order.created", target: "MLT-260520-001", timestamp: "2026-05-20T08:15:00Z" },
  { id: "al_2", actor: "Siti Aminah", action: "payment.received", target: "MLT-260520-001", timestamp: "2026-05-20T08:16:00Z", details: "Rp20.000 Tunai (DP)" },
  { id: "al_3", actor: "Budi Santoso", action: "order.status_changed", target: "MLT-260520-002", timestamp: "2026-05-20T09:30:00Z", details: "Diterima → Dicuci" },
  { id: "al_4", actor: "Owner", action: "expense.created", target: "Listrik", timestamp: "2026-05-20T10:00:00Z", details: "Rp250.000" },
];

export const customerById = (id: string) => customers.find(c => c.id === id);
export const staffById = (id: string) => staffMembers.find(s => s.id === id);
export const orderByNumber = (n: string) => orders.find(o => o.orderNumber === n);
export const orderByCode = (c: string) => orders.find(o => o.orderCode === c);