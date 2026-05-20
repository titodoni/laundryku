import { db } from "@/lib/db";

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
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const dateStr = `${yy}${mm}${dd}`;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const counter = await db.orderCounter.upsert({
        where: { branchId_date: { branchId, date: dateStr } },
        create: { branchId, date: dateStr, seq: 1 },
        update: { seq: { increment: 1 } },
      });

      return `${branchCode}-${dateStr}-${String(counter.seq).padStart(3, "0")}`;
    } catch (error: unknown) {
      lastError = error as Error;

      // P2002 = unique constraint violation (race on create branch)
      const prismaError = error as { code?: string };
      if (prismaError.code === "P2002") {
        // Another request created the row between our check and upsert.
        // Retry — the upsert will now hit the update branch instead.
        continue;
      }

      // Non-P2002 error — don't retry
      throw error;
    }
  }

  // All retries exhausted
  throw lastError ?? new Error("Failed to generate order number after retries");
}
