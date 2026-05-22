import assert from "node:assert/strict";
import { canCreateOrderFromSnapshot } from "@/lib/plan-guard-core";
import {
  getCancellationState,
  getOrderPaymentState,
  getSettlementState,
  priceOrderItem,
  validateCancellation,
  validateOrderPayment,
  validateSettlement,
} from "@/lib/order-logic";
import { isValidTransition } from "@/lib/validations/order";
import type { ServiceSummary } from "@/lib/services";

function makeService(overrides: Partial<ServiceSummary>): ServiceSummary {
  return {
    id: "svc",
    name: "Laundry",
    category: "KILOAN",
    baseServiceId: null,
    baseServiceName: null,
    baseServicePrice: null,
    isActive: true,
    sortOrder: 0,
    priceId: "price",
    price: 7000,
    priceMultiplier: null,
    ...overrides,
  };
}

const kiloan = makeService({
  id: "kiloan",
  category: "KILOAN",
  name: "Cuci Kiloan",
  price: 7000,
});

const express = makeService({
  id: "express",
  category: "EXPRESS",
  name: "Express 6 Jam",
  baseServiceId: kiloan.id,
  baseServiceName: kiloan.name,
  baseServicePrice: kiloan.price,
  price: 10500,
  priceMultiplier: 1.5,
});

const satuan = makeService({
  id: "satuan",
  category: "SATUAN",
  name: "Selimut",
  price: 18000,
});

const pricedKiloan = priceOrderItem({ service: kiloan, quantity: 2500, notes: null });
assert.equal(pricedKiloan.unitPrice, 7000);
assert.equal(pricedKiloan.subtotal, 17500);

const pricedExpress = priceOrderItem({ service: express, quantity: 3000, notes: null });
assert.equal(pricedExpress.unitPrice, 10500);
assert.equal(pricedExpress.subtotal, 31500);

const pricedSatuan = priceOrderItem({ service: satuan, quantity: 3, notes: null });
assert.equal(pricedSatuan.unitPrice, 18000);
assert.equal(pricedSatuan.subtotal, 54000);

assert.equal(validateOrderPayment(50000, "LUNAS", 50000), null);
assert.equal(validateOrderPayment(50000, "LUNAS", 40000), "Pembayaran lunas harus sama dengan total pesanan");
assert.equal(validateOrderPayment(50000, "DP", 10000), null);
assert.equal(validateOrderPayment(50000, "DP", 0), "Nominal DP harus lebih dari 0 dan kurang dari total pesanan");
assert.equal(validateOrderPayment(50000, "BELUM_BAYAR", 0), null);
assert.equal(
  validateOrderPayment(50000, "BELUM_BAYAR", 1),
  "Pesanan belum bayar tidak boleh memiliki pembayaran awal",
);

assert.deepEqual(getOrderPaymentState(50000, "LUNAS", 50000), {
  paymentStatus: "PAID",
  remainingAmount: 0,
});
assert.deepEqual(getOrderPaymentState(50000, "DP", 15000), {
  paymentStatus: "PARTIAL",
  remainingAmount: 35000,
});
assert.deepEqual(getOrderPaymentState(50000, "BELUM_BAYAR", 0), {
  paymentStatus: "UNPAID",
  remainingAmount: 50000,
});

assert.equal(validateSettlement("PARTIAL", 35000, 35000), null);
assert.equal(validateSettlement("UNPAID", 35000, 35000), "Hanya pesanan DP yang bisa dilunasi");
assert.equal(validateSettlement("PARTIAL", 35000, 10000), "Nominal pelunasan harus sama dengan sisa tagihan");
assert.deepEqual(getSettlementState(15000, 35000), {
  paymentStatus: "PAID",
  paidAmount: 50000,
  remainingAmount: 0,
});

assert.equal(validateCancellation("RECEIVED"), null);
assert.equal(validateCancellation("DELIVERED"), "Pesanan ini tidak bisa dibatalkan lagi");
assert.deepEqual(getCancellationState("READY", 15000, "  Pelanggan batal  "), {
  status: "CANCELLED",
  cancelReason: "Pelanggan batal",
  paymentStatus: "REFUNDED",
  refundAmount: -15000,
  previousStatus: "READY",
});
assert.deepEqual(getCancellationState("RECEIVED", 0, "salah input"), {
  status: "CANCELLED",
  cancelReason: "salah input",
  paymentStatus: null,
  refundAmount: 0,
  previousStatus: "RECEIVED",
});

assert.deepEqual(
  canCreateOrderFromSnapshot(
    {
      planType: "FREE",
      status: "ACTIVE",
      trialEndsAt: null,
    },
    9,
  ),
  { allowed: true },
);
assert.deepEqual(
  canCreateOrderFromSnapshot(
    {
      planType: "FREE",
      status: "ACTIVE",
      trialEndsAt: null,
    },
    10,
  ),
  {
    allowed: false,
    reason: "Batas order harian tercapai. Upgrade ke Pro.",
  },
);
assert.deepEqual(
  canCreateOrderFromSnapshot(
    {
      planType: "FREE",
      status: "TRIALING",
      trialEndsAt: new Date(Date.now() + 60_000),
    },
    10,
  ),
  { allowed: true },
);

assert.equal(isValidTransition("RECEIVED", "WASHING"), true);
assert.equal(isValidTransition("READY", "PICKED_UP"), true);
assert.equal(isValidTransition("READY", "DELIVERED"), true);
assert.equal(isValidTransition("RECEIVED", "READY"), false);
assert.equal(isValidTransition("PICKED_UP", "READY"), false);

console.log("phase3 logic ok");
