import { SectionTabs } from "@/components/imported-ui";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { storeScope } from "@/lib/db-guard";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type IncomePageProps = {
  params: { slug: string };
};

export default async function IncomePage({ params }: IncomePageProps) {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session?.user?.id) redirect(`/${params.slug}/login`);

  const store = await db.store.findFirst({ where: { slug: params.slug, ownerId: session.user.id }, select: { id: true } });
  if (!store) redirect(`/${params.slug}/login`);

  const payments = await db.payment.findMany({
    where: { ...storeScope(store.id), status: "PAID" },
    orderBy: { createdAt: "desc" },
    take: 25,
    include: { order: { select: { orderNumber: true, customer: { select: { name: true } } } } },
  });

  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-primary">Keuangan</p>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Pemasukan</h1>
        <p className="text-sm text-muted-foreground">Sumber pemasukan memakai Payment berstatus PAID.</p>
      </div>
      <SectionTabs
        tabs={[
          { href: `/${params.slug}/dashboard/finance`, label: "Ringkasan" },
          { href: `/${params.slug}/dashboard/finance/income`, label: "Pemasukan" },
          { href: `/${params.slug}/dashboard/finance/expenses`, label: "Pengeluaran" },
        ]}
      />
      <div className="grid max-w-4xl gap-2">
        {payments.map((payment) => (
          <article key={payment.id} className="rounded-xl border bg-card p-3 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-mono text-xs font-semibold text-primary">{payment.order.orderNumber}</p>
                <p className="text-sm font-medium">{payment.order.customer?.name ?? "Pelanggan Umum"}</p>
              </div>
              <p className="font-bold text-success">+Rp{payment.amount.toLocaleString("id-ID")}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
