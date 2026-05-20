import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { MetricCard } from "@/components/shared/MetricCard";
import { PlanBanner } from "@/components/shared/PlanBanner";
import { ActivityLogCard } from "@/components/shared/ActivityLogCard";
import { UpgradeCTA } from "@/components/shared/UpgradeCTA";
import { organizations, orders, activityLogs, customers } from "@/lib/mock-data";
import { formatIDR } from "@/lib/status-labels";
import { useParams } from "react-router-dom";
import { Receipt, ShoppingBag, Hourglass, CheckCircle2, Wallet, TrendingUp } from "lucide-react";

export default function DashboardHome() {
  const { slug } = useParams();
  const org = organizations.find(o => o.slug === slug) ?? organizations[0];
  const isFree = org.plan === "FREE";

  const revenueToday = orders.filter(o => o.paymentStatus === "PAID").reduce((s, o) => s + o.paid, 0);
  const ordersToday = orders.length;
  const unpaid = orders.filter(o => o.paymentStatus !== "PAID" && o.paymentStatus !== "REFUNDED").length;
  const ready = orders.filter(o => o.status === "READY").length;
  const active = orders.filter(o => !["PICKED_UP","DELIVERED","CANCELLED"].includes(o.status)).length;

  return (
    <DashboardLayout subtitle="Ringkasan operasional hari ini">
      <div className="space-y-4">
        <PlanBanner org={org} />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <MetricCard label="Pendapatan Hari Ini" value={formatIDR(revenueToday)} icon={<Wallet className="h-4 w-4" />} tone="success" />
          <MetricCard label="Order Hari Ini" value={ordersToday} icon={<Receipt className="h-4 w-4" />} />
          <MetricCard label="Belum Lunas" value={unpaid} icon={<Hourglass className="h-4 w-4" />} tone="warning" />
          <MetricCard label="Siap Diambil" value={ready} icon={<CheckCircle2 className="h-4 w-4" />} tone="info" />
          <MetricCard label="Order Aktif" value={active} icon={<ShoppingBag className="h-4 w-4" />} />
          <MetricCard label="Pengeluaran Hari Ini" value={formatIDR(330000)} icon={<TrendingUp className="h-4 w-4" />} tone="danger" />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Revenue chart placeholder */}
          <div className="rounded-xl border border-border bg-card p-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Tren Pendapatan</h3>
                <p className="text-xs text-muted-foreground">{isFree ? "Hari ini saja (Free)" : "7 hari terakhir"}</p>
              </div>
            </div>
            <div className={`mt-4 flex h-40 items-end gap-2 ${isFree ? "select-none blur-sm" : ""}`}>
              {[40,60,55,70,90,80,95].map((h, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div className="w-full rounded-t-md bg-primary/80" style={{ height: `${h}%` }} />
                  <span className="text-[10px] text-muted-foreground">{["Sn","Sl","Rb","Km","Jm","Sb","Mg"][i]}</span>
                </div>
              ))}
            </div>
            {isFree && <div className="mt-4"><UpgradeCTA message="Upgrade ke Pro untuk melihat riwayat penuh." /></div>}
          </div>

          {/* Payment split */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold">Komposisi Pembayaran</h3>
            <div className="mt-4 space-y-3 text-sm">
              {[
                { label: "Tunai", value: 55, color: "bg-primary" },
                { label: "Transfer", value: 25, color: "bg-info" },
                { label: "QRIS", value: 20, color: "bg-success" },
              ].map(p => (
                <div key={p.label}>
                  <div className="flex justify-between"><span>{p.label}</span><span className="tabular-nums">{p.value}%</span></div>
                  <div className="mt-1 h-2 w-full rounded-full bg-muted">
                    <div className={`h-2 rounded-full ${p.color}`} style={{ width: `${p.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold">Pelanggan Teratas</h3>
            <ul className="mt-3 divide-y divide-border">
              {customers.slice(0,3).map(c => (
                <li key={c.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.phone}</p>
                  </div>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{c.totalOrders} order</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold">Aktivitas Terbaru</h3>
            <ul className="mt-1">
              {activityLogs.map(l => <ActivityLogCard key={l.id} log={l} />)}
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}