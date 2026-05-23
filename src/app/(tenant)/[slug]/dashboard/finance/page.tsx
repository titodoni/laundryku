import { ImportedStatCard, SectionTabs } from "@/components/imported-ui";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { storeScope } from "@/lib/db-guard";
import { Wallet, Receipt, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type FinancePageProps = {
  params: {
    slug: string;
  };
};

function formatIDR(value: number) {
  return `Rp${value.toLocaleString("id-ID")}`;
}

export default async function FinancePage({ params }: FinancePageProps) {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session?.user?.id) redirect(`/${params.slug}/login`);

  const store = await db.store.findFirst({
    where: { slug: params.slug, ownerId: session.user.id },
    select: { id: true },
  });

  if (!store) redirect(`/${params.slug}/login`);

  const [incomeRows, expenseRows, orderCount] = await Promise.all([
    db.$queryRaw<Array<{ total: bigint | number | null }>>`
      SELECT COALESCE(SUM("amount"), 0) AS total
      FROM "Payment"
      WHERE "storeId" = ${store.id}
        AND "status" = 'PAID'
        AND "createdAt" >= date_trunc('day', now())
    `,
    db.$queryRaw<Array<{ total: bigint | number | null }>>`
      SELECT COALESCE(SUM("amount"), 0) AS total
      FROM "Expense"
      WHERE "storeId" = ${store.id}
        AND "deletedAt" IS NULL
        AND "expenseDate" >= date_trunc('day', now())
    `,
    db.order.count({
      where: {
        ...storeScope(store.id),
        deletedAt: null,
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
  ]);

  const income = Number(incomeRows[0]?.total ?? 0);
  const expense = Number(expenseRows[0]?.total ?? 0);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary">Keuangan</p>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Ringkasan Keuangan</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">Ringkasan hari ini berdasarkan pembayaran lunas dan pengeluaran tercatat.</p>
        </div>
        <div className="flex gap-2 text-sm font-semibold">
          <Link className="rounded-md border px-3 py-2" href={`/${params.slug}/dashboard/finance/income`}>Pemasukan</Link>
          <Link className="rounded-md border px-3 py-2" href={`/${params.slug}/dashboard/finance/expenses`}>Pengeluaran</Link>
        </div>
      </div>

      <SectionTabs
        tabs={[
          { href: `/${params.slug}/dashboard/finance`, label: "Ringkasan" },
          { href: `/${params.slug}/dashboard/finance/income`, label: "Pemasukan" },
          { href: `/${params.slug}/dashboard/finance/expenses`, label: "Pengeluaran" },
        ]}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ImportedStatCard label="Pemasukan Hari Ini" value={formatIDR(income)} icon={TrendingUp} tone="success" />
        <ImportedStatCard label="Pengeluaran Hari Ini" value={formatIDR(expense)} icon={TrendingDown} tone="destructive" />
        <ImportedStatCard label="Laba Bersih" value={formatIDR(income - expense)} icon={Wallet} tone="primary" />
        <ImportedStatCard label="Pesanan Hari Ini" value={orderCount} icon={Receipt} tone="warning" />
      </div>
    </section>
  );
}
