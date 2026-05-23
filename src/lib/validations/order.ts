import { z } from "zod";
import {
  normalizeOrderStatus,
  orderLifecycleStatuses,
  orderTransitionMap,
  terminalOrderStatuses,
  type OrderLifecycleStatus,
} from "@/lib/order-status";

/**
 * Zod validation schemas for order-related API endpoints.
 * Enforces data integrity constraints that the database cannot enforce
 * (no CHECK constraints in Prisma yet).
 */

export const orderItemSchema = z.object({
  serviceId: z.string().min(1, "Service ID is required"),
  quantity: z
    .number()
    .int("Quantity must be a whole number (grams for kiloan, count for satuan)")
    .min(1, "Quantity must be at least 1"),
  unitPrice: z
    .number()
    .int("Unit price must be a whole number (IDR)")
    .min(0, "Unit price cannot be negative"),
  subtotal: z
    .number()
    .int("Subtotal must be a whole number (IDR)")
    .min(0, "Subtotal cannot be negative"),
  notes: z.string().max(500).optional(),
});

export const createOrderSchema = z
  .object({
    branchId: z.string().min(1, "Branch ID is required"),
    customerId: z.string().nullable().optional(),
    items: z.array(orderItemSchema).min(1, "At least one item is required"),
    paymentType: z.enum(["LUNAS", "DP", "BELUM_BAYAR"]),
    paymentMethodId: z.string().min(1, "Payment method is required"),
    paidAmount: z
      .number()
      .int("Paid amount must be a whole number (IDR)")
      .min(0, "Paid amount cannot be negative"),
    notes: z.string().max(500).optional(),
  })
  .refine(
    (data) => {
      const totalAmount = data.items.reduce(
        (sum, item) => sum + item.subtotal,
        0
      );

      // LUNAS: paidAmount must equal totalAmount
      if (data.paymentType === "LUNAS" && data.paidAmount !== totalAmount) {
        return {
          success: false,
          error: "Paid amount must equal total amount for LUNAS payment",
        };
      }

      // DP: paidAmount must be > 0 and < totalAmount
      if (
        data.paymentType === "DP" &&
        (data.paidAmount <= 0 || data.paidAmount >= totalAmount)
      ) {
        return {
          success: false,
          error: "DP amount must be greater than 0 and less than total amount",
        };
      }

      // BELUM_BAYAR: paidAmount must be 0
      if (data.paymentType === "BELUM_BAYAR" && data.paidAmount !== 0) {
        return {
          success: false,
          error: "Paid amount must be 0 for BELUM_BAYAR payment",
        };
      }

      return { success: true };
    },
    { message: "Payment validation failed" }
  );

export const settleOrderSchema = z.object({
  paymentMethodId: z.string().min(1, "Payment method is required"),
  amount: z
    .number()
    .int("Amount must be a whole number (IDR)")
    .min(1, "Amount must be greater than 0"),
});

export const cancelOrderSchema = z.object({
  reason: z.string().min(1, "Cancellation reason is required").max(500),
});

export const updateOrderStatusSchema = z.object({
  newStatus: z.enum(orderLifecycleStatuses),
  notes: z.string().max(500).optional(),
});

/** Valid status transitions */
export const validTransitions: Record<OrderLifecycleStatus, OrderLifecycleStatus[]> = orderTransitionMap;

export const closedOrderStatuses = [...terminalOrderStatuses];

export function isValidTransition(
  currentStatus: string,
  newStatus: string
): boolean {
  const normalizedCurrentStatus = normalizeOrderStatus(currentStatus);
  const normalizedNewStatus = normalizeOrderStatus(newStatus);
  return validTransitions[normalizedCurrentStatus]?.includes(normalizedNewStatus) ?? false;
}

export function isClosedOrderStatus(status: string): boolean {
  return closedOrderStatuses.includes(status as (typeof terminalOrderStatuses)[number]);
}
