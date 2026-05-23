import { ImportedEmptyState, SectionTabs } from "@/components/imported-ui";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { storeScope } from "@/lib/db-guard";
import { Wallet } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type ExpensesPageProps = {
  params: { slug: string };
};

export default async function ExpensesPage({ params }: ExpensesPageProps) {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session?.user?.id) redirect(`/${params.slug}/login`);

  const store = await db.store.findFirst({ where: { slug: params.slug, ownerId: session.user.id }, select: { id: true } });
  if (!store) redirect(`/${params.slug}/login`);

  const expenses = await db.expense.findMany({
    where: { ...storeScope(store.id), deletedAt: null },
    orderBy: { expenseDate: "desc" },
    take: 25,
  });

  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-primary">Keuangan</p>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Pengeluaran</h1>
        <p className="text-sm text-muted-foreground">Daftar pengeluaran store-scoped terbaru.</p>
      </div>
      <SectionTabs
        tabs={[
          { href: `/${params.slug}/dashboard/finance`, label: "Ringkasan" },
          { href: `/${params.slug}/dashboard/finance/income`, label: "Pemasukan" },
          { href: `/${params.slug}/dashboard/finance/expenses`, label: "Pengeluaran" },
        ]}
      />
      {expenses.length === 0 ? (
        <ImportedEmptyState icon={Wallet} title="Belum ada pengeluaran" description="Pengeluaran akan muncul setelah pencatatan finance aktif." />
      ) : (
        <div className="grid max-w-4xl gap-2">
          {expenses.map((expense) => (
            <article key={expense.id} className="rounded-xl border bg-card p-3 shadow-soft">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{expense.description || expense.category}</p>
                  <p className="text-xs text-muted-foreground">{expense.expenseDate.toLocaleDateString("id-ID")}</p>
                </div>
                <p className="font-bold text-destructive">-Rp{expense.amount.toLocaleString("id-ID")}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
