import { db } from "@/lib/db";
import { generateOrderNumberWithClient } from "@/lib/order-number-core";

/**
 * Atomic order number generation with retry logic for P2002 race conditions.
 * Format: {BRANCH_CODE}-{YYMMDD}-{SEQ} e.g. MLT-260519-001
 *
 * Uses Prisma upsert with retry on unique constraint violation (P2002).
 * Two simultaneous first orders of the day could both attempt to create
 * a new OrderCounter row. The retry handles this edge case.
 */
export async function generateOrderNumber(
  branchId: string,
  branchCode: string,
  maxRetries = 3
): Promise<string> {
  return generateOrderNumberWithClient(db, branchId, branchCode, maxRetries);
}
