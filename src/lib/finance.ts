import { db } from "@/lib/db";

/**
 * Cash basis revenue: SUM of Payment.amount WHERE status = PAID.
 * Uses $queryRaw to keep aggregation in PostgreSQL for performance.
 */
export async function getRevenue(
  storeId: string,
  start: Date,
  end: Date,
  branchId?: string
) {
  if (branchId) {
    const result = await db.$queryRaw<{ revenue: bigint }[]>`
      SELECT COALESCE(SUM(p.amount), 0) as revenue
      FROM "Payment" p
      JOIN "Order" o ON p."orderId" = o.id
      WHERE p.status = 'PAID'
        AND p.amount > 0
        AND p."createdAt" >= ${start}
        AND p."createdAt" < ${end}
        AND o."storeId" = ${storeId}
        AND o."branchId" = ${branchId}
        AND o."deletedAt" IS NULL
    `;
    return Number(result[0]?.revenue ?? 0);
  }

  const result = await db.$queryRaw<{ revenue: bigint }[]>`
    SELECT COALESCE(SUM(p.amount), 0) as revenue
    FROM "Payment" p
    JOIN "Order" o ON p."orderId" = o.id
    WHERE p.status = 'PAID'
      AND p.amount > 0
      AND p."createdAt" >= ${start}
      AND p."createdAt" < ${end}
      AND o."storeId" = ${storeId}
      AND o."deletedAt" IS NULL
  `;
  return Number(result[0]?.revenue ?? 0);
}

/**
 * Expense total for a date range.
 */
export async function getExpenses(
  storeId: string,
  start: Date,
  end: Date,
  branchId?: string
) {
  if (branchId) {
    const result = await db.$queryRaw<{ total: bigint }[]>`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM "Expense"
      WHERE "storeId" = ${storeId}
        AND "branchId" = ${branchId}
        AND "expenseDate" >= ${start}
        AND "expenseDate" < ${end}
        AND "deletedAt" IS NULL
    `;
    return Number(result[0]?.total ?? 0);
  }

  const result = await db.$queryRaw<{ total: bigint }[]>`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM "Expense"
    WHERE "storeId" = ${storeId}
      AND "expenseDate" >= ${start}
      AND "expenseDate" < ${end}
      AND "deletedAt" IS NULL
  `;
  return Number(result[0]?.total ?? 0);
}

export async function getNetProfit(
  storeId: string,
  start: Date,
  end: Date,
  branchId?: string
) {
  const [revenue, expenses] = await Promise.all([
    getRevenue(storeId, start, end, branchId),
    getExpenses(storeId, start, end, branchId),
  ]);
  return revenue - expenses;
}

/**
 * Receivables = unpaid + partial remaining amounts.
 * Informational only — not included in P&L.
 */
export async function getReceivables(storeId: string) {
  const result = await db.$queryRaw<{ total: bigint }[]>`
    SELECT COALESCE(SUM("remainingAmount"), 0) as total
    FROM "Order"
    WHERE "storeId" = ${storeId}
      AND "paymentStatus" IN ('UNPAID', 'PARTIAL')
      AND "deletedAt" IS NULL
  `;
  return Number(result[0]?.total ?? 0);
}

/**
 * Down payments not yet settled (partial payment orders).
 */
export async function getUnsettledDP(storeId: string) {
  const result = await db.$queryRaw<{ total: bigint }[]>`
    SELECT COALESCE(SUM("remainingAmount"), 0) as total
    FROM "Order"
    WHERE "storeId" = ${storeId}
      AND "paymentStatus" = 'PARTIAL'
      AND "deletedAt" IS NULL
  `;
  return Number(result[0]?.total ?? 0);
}
