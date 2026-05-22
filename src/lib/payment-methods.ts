import type { PaymentMethod, PaymentType } from "@prisma/client";

export const paymentTypeLabels: Record<PaymentType, string> = {
  CASH: "Tunai",
  TRANSFER: "Transfer",
  QRIS: "QRIS",
};

export type PaymentMethodSummary = {
  id: string;
  name: string;
  type: PaymentType;
  typeLabel: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export function serializePaymentMethod(method: PaymentMethod): PaymentMethodSummary {
  return {
    id: method.id,
    name: method.name,
    type: method.type,
    typeLabel: paymentTypeLabels[method.type],
    isActive: method.isActive,
    createdAt: method.createdAt.toISOString(),
    updatedAt: method.updatedAt.toISOString(),
  };
}
