import {
  getCancellationState,
  getOrderPaymentState,
  getSettlementState,
  priceOrderItem,
  validateCancellation,
  validateOrderPayment,
  validateSettlement,
} from "@/lib/order-logic";
import { generateOrderNumberWithClient } from "@/lib/order-number-core";
import { isValidTransition } from "@/lib/validations/order";
import { formatIDR, serializeService, serviceQueryInclude } from "@/lib/services";
import { PrismaClient } from "@prisma/client";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

function loadEnvFile(filepath: string) {
  const raw = fs.readFileSync(filepath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^"(.*)"$/, "$1");
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.resolve(process.cwd(), ".env.local"));

const db = new PrismaClient({
  log: ["error", "warn"],
});

async function main() {
  const nonce = `phase3-smoke-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
  const email = `${nonce}@example.com`;
  const phone = `62812${Date.now().toString().slice(-8)}`;
  const branchCode = `S${Date.now().toString().slice(-2)}`.slice(0, 3).toUpperCase();

  const created = await db.$transaction(async (tx) => {
    const owner = await tx.user.create({
      data: {
        name: "Phase 3 Smoke",
        email,
        emailVerified: true,
      },
    });

    const store = await tx.store.create({
      data: {
        name: `Smoke ${nonce}`,
        slug: nonce,
        ownerId: owner.id,
        phone,
        whatsappPhone: phone,
        address: "Smoke Address",
        defaultSlaHours: 24,
      },
    });

    const branch = await tx.branch.create({
      data: {
        storeId: store.id,
        name: "Cabang Smoke",
        code: branchCode,
        phone,
      },
    });

    await tx.subscription.create({
      data: {
        storeId: store.id,
        planType: "FREE",
        status: "TRIALING",
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const staffUser = await tx.user.create({
      data: {
        name: "Staf Smoke",
        email: `${nonce}.staff@staff.laundryku.local`,
        phone: `${phone}9`,
        emailVerified: true,
      },
    });

    const staff = await tx.staffMember.create({
      data: {
        userId: staffUser.id,
        storeId: store.id,
        branchId: branch.id,
        role: "CASHIER",
        pinHash: "smoke-pin-hash",
      },
    });

    const customer = await tx.customer.create({
      data: {
        storeId: store.id,
        name: "Pelanggan Smoke",
        phone: `${phone}1`,
      },
    });

    const kiloan = await tx.service.create({
      data: {
        storeId: store.id,
        name: "Cuci Kiloan",
        category: "KILOAN",
        sortOrder: 0,
        prices: {
          create: {
            price: 7000,
            isDefault: true,
          },
        },
      },
      include: serviceQueryInclude,
    });

    const express = await tx.service.create({
      data: {
        storeId: store.id,
        name: "Express 6 Jam",
        category: "EXPRESS",
        baseServiceId: kiloan.id,
        sortOrder: 1,
        prices: {
          create: {
            price: 10500,
            priceMultiplier: 1.5,
            isDefault: true,
          },
        },
      },
      include: serviceQueryInclude,
    });

    const cash = await tx.paymentMethod.create({
      data: {
        storeId: store.id,
        name: "Tunai",
        type: "CASH",
      },
    });

    return { owner, store, branch, staff, customer, kiloan, express, cash };
  });

  try {
    const kiloan = serializeService(created.kiloan as never);
    const express = serializeService(created.express as never);

    const item1 = priceOrderItem({
      service: kiloan,
      quantity: 2000,
      notes: null,
    });
    const item2 = priceOrderItem({
      service: express,
      quantity: 3000,
      notes: "cepat",
    });

    assert.equal(item1.subtotal, 14000);
    assert.equal(item2.subtotal, 31500);

    const totalAmount = item1.subtotal + item2.subtotal;
    assert.equal(validateOrderPayment(totalAmount, "DP", 10000), null);

    const initialPayment = getOrderPaymentState(totalAmount, "DP", 10000);
    const orderNumber = await generateOrderNumberWithClient(db, created.branch.id, created.branch.code);

    const order = await db.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          storeId: created.store.id,
          branchId: created.branch.id,
          customerId: created.customer.id,
          cashierId: created.staff.id,
          orderNumber,
          totalAmount,
          paidAmount: 10000,
          remainingAmount: initialPayment.remainingAmount,
          paymentStatus: initialPayment.paymentStatus,
          estimatedReadyAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          items: {
            create: [
              {
                serviceId: kiloan.id,
                quantity: item1.quantity,
                unitPrice: item1.unitPrice,
                subtotal: item1.subtotal,
              },
              {
                serviceId: express.id,
                quantity: item2.quantity,
                unitPrice: item2.unitPrice,
                subtotal: item2.subtotal,
                notes: item2.notes,
              },
            ],
          },
          payments: {
            create: {
              storeId: created.store.id,
              paymentMethodId: created.cash.id,
              amount: 10000,
              status: "PAID",
              paidAt: new Date(),
              notes: "DP awal",
            },
          },
        },
        include: {
          items: true,
          payments: true,
        },
      });

      await tx.activityLog.create({
        data: {
          storeId: created.store.id,
          actorType: "staff",
          actorId: created.staff.id,
          actorName: "Staf Smoke",
          action: "order.created",
          targetType: "order",
          targetId: createdOrder.id,
          details: { orderNumber: createdOrder.orderNumber },
        },
      });

      return createdOrder;
    });

    assert.equal(order.orderNumber.startsWith(`${created.branch.code}-`), true);
    assert.equal(order.paymentStatus, "PARTIAL");
    assert.equal(order.remainingAmount, totalAmount - 10000);
    assert.equal(order.items.length, 2);

    assert.equal(isValidTransition("RECEIVED", "PROCESS"), true);
    const processingOrder = await db.order.update({
      where: { id: order.id },
      data: { status: "PROCESS" },
    });
    assert.equal(processingOrder.status, "PROCESS");
    assert.equal(isValidTransition("PROCESS", "READY"), true);
    const readyOrder = await db.order.update({
      where: { id: order.id },
      data: { status: "READY" },
    });
    assert.equal(readyOrder.status, "READY");

    const settlementError = validateSettlement(order.paymentStatus, order.remainingAmount, order.remainingAmount);
    assert.equal(settlementError, null);
    const settlementState = getSettlementState(order.paidAmount, order.remainingAmount);
    const settledAt = new Date();
    const settledOrder = await db.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          storeId: created.store.id,
          orderId: order.id,
          paymentMethodId: created.cash.id,
          amount: order.remainingAmount,
          status: "PAID",
          paidAt: settledAt,
          notes: "Pelunasan smoke",
        },
      });

      return tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: settlementState.paymentStatus,
          paidAmount: settlementState.paidAmount,
          remainingAmount: settlementState.remainingAmount,
          settledAt,
        },
      });
    });

    assert.equal(settledOrder.paymentStatus, "PAID");
    assert.equal(settledOrder.remainingAmount, 0);
    assert.equal(settledOrder.paidAmount, totalAmount);

    assert.equal(isValidTransition("READY", "PICKED_UP"), true);
    const pickedUpOrder = await db.order.update({
      where: { id: order.id },
      data: {
        status: "PICKED_UP",
        completedAt: new Date(),
      },
    });
    assert.equal(pickedUpOrder.status, "PICKED_UP");
    assert.equal(isValidTransition("PICKED_UP", "CLOSED"), true);
    const closedOrder = await db.order.update({
      where: { id: order.id },
      data: { status: "CLOSED" },
    });
    assert.equal(closedOrder.status, "CLOSED");
    assert.equal(validateCancellation("READY"), null);
    assert.equal(validateCancellation("CLOSED"), "Pesanan ini tidak bisa dibatalkan lagi");
    const cancellationState = getCancellationState("READY", settledOrder.paidAmount, "Pelanggan batal ambil");
    assert.equal(cancellationState.status, "CANCELLED");
    assert.equal(cancellationState.paymentStatus, "REFUNDED");

    console.log("phase3 db smoke ok");
    console.log(`orderNumber=${orderNumber}`);
    console.log(`total=${formatIDR(totalAmount)}`);
  } finally {
    await db.payment.deleteMany({
      where: {
        storeId: created.store.id,
      },
    });

    await db.orderItem.deleteMany({
      where: {
        order: {
          storeId: created.store.id,
        },
      },
    });

    await db.activityLog.deleteMany({
      where: {
        storeId: created.store.id,
      },
    });

    await db.orderCounter.deleteMany({
      where: {
        branchId: created.branch.id,
      },
    });

    await db.order.deleteMany({
      where: {
        storeId: created.store.id,
      },
    });

    await db.customer.deleteMany({
      where: {
        storeId: created.store.id,
      },
    });

    await db.staffMember.deleteMany({
      where: {
        storeId: created.store.id,
      },
    });

    await db.paymentMethod.deleteMany({
      where: {
        storeId: created.store.id,
      },
    });

    await db.servicePrice.deleteMany({
      where: {
        service: {
          storeId: created.store.id,
        },
      },
    });

    await db.service.deleteMany({
      where: {
        storeId: created.store.id,
      },
    });

    await db.branch.deleteMany({
      where: {
        storeId: created.store.id,
      },
    });

    await db.subscription.deleteMany({
      where: {
        storeId: created.store.id,
      },
    });

    await db.store.delete({
      where: {
        id: created.store.id,
      },
    });

    await db.user.deleteMany({
      where: {
        email: {
          in: [email, `${nonce}.staff@staff.laundryku.local`],
        },
      },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
