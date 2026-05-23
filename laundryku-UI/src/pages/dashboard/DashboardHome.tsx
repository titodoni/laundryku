import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { OrderCard } from "@/components/OrderCard";
import { UpgradeCTA } from "@/components/UpgradeCTA";
import { Link } from "react-router-dom";
import { Wallet, ShoppingBag, Scale, Users, ArrowRight, Lock, CalendarDays } from "lucide-react";
import { orders, todayIncome, todayOrdersCount, todayWeight, org, activityLogs } from "@/mocks/data";
import { formatRupiah, formatTanggalRelatif, formatTanggal } from "@/lib/format";
import { PlanBadge } from "@/components/PlanBadge";

const DashboardHome = () => {
  const isFree = org.plan === "FREE";
  const trialEnds = org.trialEndsAt ? formatTanggal(org.trialEndsAt) : null;
  const recent = orders.slice(0, 4);

  return (
    <AppShell title="Beranda" subtitle={formatTanggalRelatif(new Date()) + " · " + formatTanggal(new Date())}>
      <div className="container py-4 space-y-4 max-w-5xl">
        {org.subscriptionStatus === "TRIALING" && trialEnds && (
          <div className="rounded-xl border bg-primary-soft p-3 flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Masa uji coba Pro berakhir {trialEnds}</p>
              <p className="text-xs text-muted-foreground">Aktifkan langganan agar fitur tetap aktif.</p>
            </div>
            <Link to="/melati-clean/dashboard/billing" className="text-sm font-semibold text-primary whitespace-nowrap">Aktifkan</Link>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Pemasukan Hari Ini" value={formatRupiah(todayIncome)} icon={Wallet} tone="primary" />
          <StatCard label="Pesanan Hari Ini" value={`${todayOrdersCount}${isFree ? `/${org.ordersTodayLimit}` : ""}`} icon={ShoppingBag} tone="success" hint={isFree ? "Batas paket Free" : undefined} />
          <StatCard label="Total Berat" value={`${todayWeight.toFixed(1)} kg`} icon={Scale} tone="warning" />
          <StatCard label="Pelanggan Aktif" value={isFree ? "—" : 142} icon={Users} hint={isFree ? "Pro" : "30 hari terakhir"} />
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-xl border bg-card">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h2 className="font-semibold font-display">Pesanan Terbaru</h2>
                <p className="text-xs text-muted-foreground">Pantau pesanan masuk hari ini</p>
              </div>
              <Link to="/melati-clean/pos/orders" className="text-xs font-semibold text-primary inline-flex items-center gap-0.5">
                Semua <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="p-3 space-y-2">
              {recent.map(o => <OrderCard key={o.id} order={o} />)}
            </div>
          </div>

          <div className="space-y-4">
            {isFree ? <UpgradeCTA /> : (
              <div className="rounded-2xl border bg-card p-4">
                <PlanBadge plan={org.plan} status={org.subscriptionStatus} />
                <p className="mt-2 font-semibold font-display">Anda sedang menggunakan Pro</p>
                <p className="text-xs text-muted-foreground mt-1">Semua fitur aktif tanpa batas.</p>
              </div>
            )}

            <div className="rounded-xl border bg-card">
              <div className="p-3 border-b">
                <h3 className="font-semibold text-sm">Aktivitas Terbaru</h3>
              </div>
              <ul className="divide-y">
                {activityLogs.slice(0, 4).map(l => (
                  <li key={l.id} className="p-3 text-sm">
                    <p className="font-medium leading-tight">{l.action}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{l.actor} · {formatTanggalRelatif(l.createdAt)}</p>
                  </li>
                ))}
              </ul>
              {isFree && (
                <div className="p-3 border-t bg-muted/40 flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="h-3.5 w-3.5" /> Riwayat lengkap tersedia di paket Pro
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default DashboardHome;
