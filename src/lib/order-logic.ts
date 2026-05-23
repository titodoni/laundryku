import type { ServiceSummary } from "@/lib/services";
import { getServiceDisplayPrice } from "@/lib/services";
import { isNonCancellableOrderStatus, type OrderLifecycleStatus } from "@/lib/order-status";

export type PaymentTypeInput = "LUNAS" | "DP" | "BELUM_BAYAR";
export type PaymentStatusOutput = "PAID" | "PARTIAL" | "UNPAID";

export type DraftOrderItemInput = {
  service: ServiceSummary;
  quantity: number;
  notes: string | null;
};

export type PricedOrderItem = {
  service: ServiceSummary;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes: string | null;
};

export function priceOrderItem(input: DraftOrderItemInput): PricedOrderItem {
  const unitPrice = getServiceDisplayPrice(input.service);
  const subtotal =
    input.service.category === "KILOAN" || input.service.category === "EXPRESS"
      ? Math.round((unitPrice * input.quantity) / 1000)
      : unitPrice * input.quantity;

  return {
    service: input.service,
    quantity: input.quantity,
    unitPrice,
    subtotal,
    notes: input.notes,
  };
}

export function validateOrderPayment(totalAmount: number, paymentType: PaymentTypeInput, paidAmount: number) {
  if (paymentType === "LUNAS" && paidAmount !== totalAmount) {
    return "Pembayaran lunas harus sama dengan total pesanan";
  }

  if (paymentType === "DP" && (paidAmount <= 0 || paidAmount >= totalAmount)) {
    return "Nominal DP harus lebih dari 0 dan kurang dari total pesanan";
  }

  if (paymentType === "BELUM_BAYAR" && paidAmount !== 0) {
    return "Pesanan belum bayar tidak boleh memiliki pembayaran awal";
  }

  return null;
}

export function getOrderPaymentState(totalAmount: number, paymentType: PaymentTypeInput, paidAmount: number) {
  const paymentStatus: PaymentStatusOutput =
    paymentType === "LUNAS"
      ? "PAID"
      : paymentType === "DP"
        ? "PARTIAL"
        : "UNPAID";

  return {
    paymentStatus,
    remainingAmount: Math.max(totalAmount - paidAmount, 0),
  };
}

export function validateSettlement(paymentStatus: string, remainingAmount: number, amount: number) {
  if (paymentStatus !== "PARTIAL") {
    return "Hanya pesanan DP yang bisa dilunasi";
  }

  if (amount < remainingAmount) {
    return "Nominal pelunasan harus sama dengan sisa tagihan";
  }

  return null;
}

export function getSettlementState(paidAmount: number, remainingAmount: number) {
  return {
    paymentStatus: "PAID" as const,
    paidAmount: paidAmount + remainingAmount,
    remainingAmount: 0,
  };
}

export function validateCancellation(status: OrderLifecycleStatus) {
  if (isNonCancellableOrderStatus(status)) {
    return "Pesanan ini tidak bisa dibatalkan lagi";
  }

  return null;
}

export function getCancellationState(status: OrderLifecycleStatus, paidAmount: number, reason: string) {
  return {
    status: "CANCELLED" as const,
    cancelReason: reason.trim(),
    paymentStatus: paidAmount > 0 ? ("REFUNDED" as const) : null,
    refundAmount: paidAmount > 0 ? -paidAmount : 0,
    previousStatus: status,
  };
}
