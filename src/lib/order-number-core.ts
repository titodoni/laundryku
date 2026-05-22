type OrderCounterClient = {
  orderCounter: {
    upsert(args: {
      where: { branchId_date: { branchId: string; date: string } };
      create: { branchId: string; date: string; seq: number };
      update: { seq: { increment: number } };
    }): Promise<{ seq: number }>;
  };
};

function getDateKey(now: Date) {
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yy}${mm}${dd}`;
}

export async function generateOrderNumberWithClient(
  client: OrderCounterClient,
  branchId: string,
  branchCode: string,
  maxRetries = 3,
): Promise<string> {
  const dateStr = getDateKey(new Date());
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt += 1) {
    try {
      const counter = await client.orderCounter.upsert({
        where: { branchId_date: { branchId, date: dateStr } },
        create: { branchId, date: dateStr, seq: 1 },
        update: { seq: { increment: 1 } },
      });

      return `${branchCode}-${dateStr}-${String(counter.seq).padStart(3, "0")}`;
    } catch (error: unknown) {
      lastError = error as Error;
      const prismaError = error as { code?: string };
      if (prismaError.code === "P2002") {
        continue;
      }

      throw error;
    }
  }

  throw lastError ?? new Error("Failed to generate order number after retries");
}
