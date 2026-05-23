// Internal enum values (English). Display labels live in labels.ts
export type Plan = "FREE" | "PRO";
export type SubscriptionStatus = "TRIALING" | "ACTIVE" | "LIMITED" | "PAST_DUE" | "CANCELLED" | "EXPIRED";
export type Role = "ADMIN" | "CASHIER" | "OPERATOR" | "COURIER";
export type ServiceType = "KILOAN" | "SATUAN" | "EXPRESS" | "ADDON";
export type PaymentChannel = "CASH" | "TRANSFER" | "QRIS";
export type OrderStatus = "RECEIVED" | "WASHING" | "DRYING" | "IRONING" | "PACKING" | "READY" | "PICKED_UP" | "DELIVERED";
export type PaymentStatus = "UNPAID" | "PARTIAL" | "PAID" | "REFUNDED";
export type ExpenseCategory = "ELECTRICITY" | "WATER" | "FRAGRANCE" | "PACKAGING" | "SALARY" | "OPERATIONAL";
export type InvoiceStatus = "PENDING" | "PAID" | "FAILED";

export interface Organization {
  id: string; slug: string; name: string; plan: Plan;
  subscriptionStatus: SubscriptionStatus; trialEndsAt?: string; ordersTodayLimit?: number;
}
export interface Branch { id: string; orgId: string; name: string; address: string; phone: string; }
export interface StaffMember { id: string; orgId: string; name: string; role: Role; phone: string; active: boolean; }
export interface Customer { id: string; orgId: string; name: string; phone: string; address?: string; totalOrders: number; totalSpent: number; lastOrderAt?: string; }
export interface ServicePrice { id: string; serviceId: string; pricePerKg?: number; pricePerItem?: number; estimationHours: number; }
export interface Service { id: string; orgId: string; name: string; type: ServiceType; description?: string; price: ServicePrice; active: boolean; }
export interface PaymentMethod { id: string; orgId: string; channel: PaymentChannel; label: string; details?: string; active: boolean; }
export interface OrderItem { id: string; serviceId: string; serviceName: string; serviceType: ServiceType; qty: number; unit: "kg" | "pcs"; pricePerUnit: number; subtotal: number; note?: string; }
export interface Payment { id: string; orderId: string; channel: PaymentChannel; amount: number; paidAt: string; }
export interface Order {
  id: string; orgId: string; branchId: string; code: string; customerId: string; customerName: string; customerPhone: string;
  items: OrderItem[]; subtotal: number; discount: number; total: number; paid: number;
  status: OrderStatus; paymentStatus: PaymentStatus; createdAt: string; estimatedReadyAt: string;
  cashierId: string; cashierName: string; note?: string; payments: Payment[];
}
export interface Expense { id: string; orgId: string; branchId: string; category: ExpenseCategory; amount: number; note: string; createdAt: string; }
export interface Subscription { plan: Plan; status: SubscriptionStatus; trialEndsAt?: string; renewsAt?: string; pricePerMonth: number; }
export interface Invoice { id: string; number: string; periodStart: string; periodEnd: string; amount: number; status: InvoiceStatus; }
export interface ActivityLog { id: string; actor: string; action: string; createdAt: string; }
