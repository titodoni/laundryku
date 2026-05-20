import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * CSV export for finance ledger (Pro only).
 *
 * SAFETY: Max 5000 rows to prevent Vercel serverless timeout (10s Hobby / 60s Pro).
 * If the store has more data, the owner must narrow the date range.
 */
const MAX_EXPORT_ROWS = 5000;

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const startParam = searchParams.get("start");
    const endParam = searchParams.get("end");
    const branchIdParam = searchParams.get("branchId");

    const start = startParam ? new Date(startParam) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endParam ? new Date(endParam) : new Date();

    // Find store by slug
    const store = await db.store.findUnique({ where: { slug } });
    if (!store) {
      return NextResponse.json(
        { success: false, error: "Store not found" },
        { status: 404 }
      );
    }

    // Fetch income rows (payments)
    const payments = await db.payment.findMany({
      where: {
        amount: { gt: 0 },
        status: "PAID",
        createdAt: { gte: start, lt: end },
        order: {
          storeId: store.id,
          ...(branchIdParam ? { branchId: branchIdParam } : {}),
          deletedAt: null,
        },
      },
      include: {
        order: { select: { orderNumber: true, customer: { select: { name: true } } } },
        paymentMethod: { select: { name: true } },
      },
      orderBy: { createdAt: "asc" },
      take: MAX_EXPORT_ROWS,
    });

    // Fetch expense rows
    const expenses = await db.expense.findMany({
      where: {
        storeId: store.id,
        ...(branchIdParam ? { branchId: branchIdParam } : {}),
        expenseDate: { gte: start, lt: end },
        deletedAt: null,
      },
      orderBy: { expenseDate: "asc" },
      take: MAX_EXPORT_ROWS,
    });

    // Build CSV
    const rows: string[] = [
      "Tanggal,Tipe,Kategori,Deskripsi,Nominal,Saldo",
    ];

    let balance = 0;

    // Add income rows
    for (const p of payments) {
      balance += p.amount;
      rows.push(
        [
          p.createdAt.toISOString().split("T")[0],
          "Masuk",
          p.paymentMethod?.name ?? "N/A",
          `Pembayaran ${p.order.orderNumber}${p.order.customer?.name ? ` - ${p.order.customer.name}` : ""}`,
          p.amount.toString(),
          balance.toString(),
        ].join(",")
      );
    }

    // Add expense rows
    for (const e of expenses) {
      balance -= e.amount;
      rows.push(
        [
          e.expenseDate.toISOString().split("T")[0],
          "Keluar",
          e.category,
          e.description ?? "",
          e.amount.toString(),
          balance.toString(),
        ].join(",")
      );
    }

    // Sort all rows by date (skip header)
    const header = rows[0];
    const dataRows = rows.slice(1).sort((a, b) => {
      const dateA = a.split(",")[0];
      const dateB = b.split(",")[0];
      return dateA.localeCompare(dateB);
    });

    const csv = [header, ...dataRows].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="laundryku-finance-${slug}-${start.toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Export failed" },
      { status: 500 }
    );
  }
}
