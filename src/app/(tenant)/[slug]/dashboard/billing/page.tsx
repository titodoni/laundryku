import { ImportedPlanBadge } from "@/components/imported-ui";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CheckCircle2, Crown } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type BillingPageProps = {
  params: { slug: string };
};

export default async function BillingPage({ params }: BillingPageProps) {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session?.user?.id) redirect(`/${params.slug}/login`);

  const store = await db.store.findFirst({
    where: { slug: params.slug, ownerId: session.user.id },
    select: {
      subscription: {
        select: {
          planType: true,
          status: true,
          trialEndsAt: true,
          nextChargeAt: true,
        },
      },
    },
  });

  if (!store) redirect(`/${params.slug}/login`);

  const subscription = store.subscription;

  return (
    <section className="max-w-3xl space-y-4">
      <div>
        <p className="text-sm font-semibold text-primary">Tagihan</p>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Langganan</h1>
        <p className="text-sm text-muted-foreground">Status langganan aktif dari data Subscription.</p>
      </div>
      <div className="rounded-2xl bg-gradient-primary p-5 text-primary-foreground shadow-glow">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          <ImportedPlanBadge
            plan={subscription?.planType ?? "FREE"}
            status={subscription?.status ?? "TRIALING"}
            className="bg-white/20 text-primary-foreground"
          />
        </div>
        <p className="mt-3 font-display text-3xl font-bold">Rp65.000<span className="text-sm font-normal opacity-80">/bulan</span></p>
        {subscription?.trialEndsAt ? <p className="mt-1 text-sm opacity-95">Masa uji coba berakhir {subscription.trialEndsAt.toLocaleDateString("id-ID")}</p> : null}
        {subscription?.nextChargeAt ? <p className="text-sm opacity-95">Tagihan berikutnya {subscription.nextChargeAt.toLocaleDateString("id-ID")}</p> : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {["Pesanan tak terbatas", "Staff tak terbatas", "Laporan lengkap", "Multi cabang", "Ekspor data", "Tracking publik"].map((feature) => (
          <div key={feature} className="flex items-center gap-2 rounded-xl border bg-card p-3">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
            <span className="text-sm font-medium">{feature}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
