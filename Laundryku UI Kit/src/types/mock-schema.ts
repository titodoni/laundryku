export type PlanType = "FREE" | "PRO";
export type OrgStatus = "TRIALING" | "ACTIVE" | "LIMITED" | "PAST_DUE" | "CANCELLED" | "EXPIRED";
export type StaffRole = "ADMIN" | "CASHIER" | "OPERATOR" | "COURIER";
export type ServiceCategory = "KILOAN" | "SATUAN" | "EXPRESS" | "ADDON";
export type PaymentType = "CASH" | "TRANSFER" | "QRIS";
export type OrderStatus =
  | "RECEIVED" | "WASHING" | "DRYING" | "IRONING" | "PACKING"
  | "READY" | "PICKED_UP" | "DELIVERED" | "CANCELLED";
export type PaymentStatus = "UNPAID" | "PARTIAL" | "PAID" | "REFUNDED";
export type ExpenseCategory = "ELECTRICITY" | "WATER" | "FRAGRANCE" | "PACKAGING" | "SALARY" | "OPERATIONAL";
export type SubscriptionStatus = OrgStatus;
export type InvoiceStatus = "PENDING" | "PAID" | "FAILED" | "EXPIRED";

export interface Organization {
  id: string; slug: string; name: string; logoUrl?: string;
  phone: string; address: string; plan: PlanType; status: OrgStatus;
  trialEndsAt?: string;
}
export interface Branch { id: string; orgId: string; name: string; code: string; address: string; phone: string; }
export interface StaffMember {
  id: string; orgId: string; branchId: string; name: string; phone: string;
  role: StaffRole; active: boolean; lastActive?: string; pinSet: boolean;
}
export interface Customer {
  id: string; orgId: string; name: string; phone: string;
  totalOrders: number; lastOrderAt?: string; tags?: string[];
}
export interface Service {
  id: string; orgId: string; name: string; category: ServiceCategory;
  price: number; unit: string; minQty: number; active: boolean;
}
export interface PaymentMethod {
  id: string; orgId: string; type: PaymentType; displayName: string;
  active: boolean; qrisImageUrl?: string;
}
export interface OrderItem { serviceId: string; name: string; qty: number; unit: string; price: number; subtotal: number; notes?: string; }
export interface Payment { id: string; orderId: string; methodId: string; amount: number; paidAt: string; type: PaymentType; }
export interface Order {
  id: string; orgId: string; branchId: string; orderNumber: string; orderCode: string;
  customerId: string; cashierId: string;
  items: OrderItem[]; total: number; paid: number; remaining: number;
  status: OrderStatus; paymentStatus: PaymentStatus;
  createdAt: string; estimatedReadyAt: string; notes?: string;
}
export interface Expense {
  id: string; orgId: string; branchId: string; date: string;
  category: ExpenseCategory; amount: number; notes?: string;
}
export interface Subscription { id: string; orgId: string; plan: PlanType; status: SubscriptionStatus; renewsAt?: string; trialEndsAt?: string; }
export interface Invoice { id: string; orgId: string; number: string; amount: number; status: InvoiceStatus; issuedAt: string; paidAt?: string; }
export interface ActivityLog { id: string; actor: string; action: string; target: string; timestamp: string; details?: string; }