import { ImportedPlanBadge, ImportedStatCard, formatRupiah } from "@/components/imported-ui";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CalendarDays, Package2, Receipt, Users, Wallet } from "lucide-react";
import Link from "next/link";

type DashboardPageProps = {
  params: {
    slug: string;
  };
};

export default async function DashboardPage({ params }: DashboardPageProps) {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session?.user?.id) {
    redirect(`/${params.slug}/login`);
  }

  const store = await db.store.findFirst({
    where: { slug: params.slug, ownerId: session.user.id },
    select: {
      id: true,
      name: true,
      branches: {
        orderBy: {
          createdAt: "asc",
        },
        select: { name: true },
      },
      subscription: { select: { planType: true, status: true, trialEndsAt: true } },
    },
  });

  if (!store) {
    redirect(`/${params.slug}/login`);
  }

  const [incomeRows, orderCount, staffCount, serviceCount] = await Promise.all([
    db.$queryRaw<Array<{ total: bigint | number | null }>>`
      SELECT COALESCE(SUM("amount"), 0) AS total
      FROM "Payment"
      WHERE "storeId" = ${store.id}
        AND "status" = 'PAID'
        AND "createdAt" >= date_trunc('day', now())
    `,
    db.order.count({
      where: {
        storeId: store.id,
        deletedAt: null,
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
    db.staffMember.count({ where: { storeId: store.id, isActive: true } }),
    db.service.count({ where: { storeId: store.id, isActive: true } }),
  ]);

  const planType = store.subscription?.planType ?? "FREE";
  const subscriptionStatus = store.subscription?.status ?? "TRIALING";

  return (
    <section className="space-y-4">
      {subscriptionStatus === "TRIALING" && store.subscription?.trialEndsAt ? (
        <div className="flex items-center gap-3 rounded-xl border bg-primary-soft p-3">
          <CalendarDays className="h-5 w-5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Masa uji coba Pro berakhir {store.subscription.trialEndsAt.toLocaleDateString("id-ID")}</p>
            <p className="text-xs text-muted-foreground">Aktifkan langganan agar fitur tetap aktif.</p>
          </div>
          <Link href={`/${params.slug}/dashboard/billing`} className="whitespace-nowrap text-sm font-semibold text-primary">Aktifkan</Link>
        </div>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary">Beranda</p>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{store.name}</h1>
          <p className="text-sm text-muted-foreground">Ringkasan operasional hari ini.</p>
        </div>
        <ImportedPlanBadge plan={planType} status={subscriptionStatus} />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <ImportedStatCard label="Pemasukan Hari Ini" value={formatRupiah(Number(incomeRows[0]?.total ?? 0))} icon={Wallet} tone="primary" />
        <ImportedStatCard label="Pesanan Hari Ini" value={orderCount} icon={Receipt} tone="success" />
        <ImportedStatCard label="Staff Aktif" value={staffCount} icon={Users} tone="warning" />
        <ImportedStatCard label="Layanan Aktif" value={serviceCount} icon={Package2} />
      </div>

      <div className="rounded-xl border bg-card p-4 shadow-soft">
        <h2 className="font-display font-semibold">Akses cepat</h2>
        <div className="mt-3 flex flex-wrap gap-2 text-sm font-semibold">
          <Link className="rounded-md border px-3 py-2" href={`/${params.slug}/pos`}>Buka POS</Link>
          <Link className="rounded-md border px-3 py-2" href={`/${params.slug}/pos/orders`}>Pesanan</Link>
          <Link className="rounded-md border px-3 py-2" href={`/${params.slug}/dashboard/services`}>Layanan</Link>
          <Link className="rounded-md border px-3 py-2" href={`/${params.slug}/dashboard/settings/branch`}>Pengaturan</Link>
        </div>
      </div>
    </section>
  );
}
