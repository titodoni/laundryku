import { AppShell } from "@/components/AppShell";
import { PlanBadge } from "@/components/PlanBadge";
import { Button } from "@/components/ui/button";
import { subscription, invoices } from "@/mocks/data";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { invoiceStatusLabel } from "@/lib/labels";
import { Crown, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const toneByStatus = { PAID: "bg-success/15 text-success", PENDING: "bg-warning/15 text-warning", FAILED: "bg-destructive/15 text-destructive" } as const;

const Billing = () => {
  return (
    <AppShell title="Tagihan" subtitle="Kelola langganan dan invoice">
      <div className="container py-4 max-w-3xl space-y-4">
        <div className="rounded-2xl bg-gradient-primary text-primary-foreground p-5 shadow-glow">
          <div className="flex items-center gap-2"><Crown className="h-5 w-5" /><PlanBadge plan={subscription.plan} status={subscription.status} className="bg-white/20 text-primary-foreground" /></div>
          <p className="mt-3 text-3xl font-bold font-display">{formatRupiah(subscription.pricePerMonth)}<span className="text-sm font-normal opacity-80">/bulan</span></p>
          {subscription.trialEndsAt && (
            <p className="mt-1 text-sm opacity-95">Masa uji coba berakhir {formatTanggal(subscription.trialEndsAt)}</p>
          )}
          {subscription.renewsAt && (
            <p className="text-sm opacity-95">Perpanjangan otomatis {formatTanggal(subscription.renewsAt)}</p>
          )}
          <Button variant="secondary" className="mt-4 font-semibold">Kelola Langganan</Button>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          {["Pesanan tak terbatas","Staff tak terbatas","Multi cabang","Ekspor data","Laporan lengkap","Tracking publik"].map(f => (
            <div key={f} className="rounded-xl border bg-card p-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
              <span className="text-sm font-medium">{f}</span>
            </div>
          ))}
        </div>

        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold font-display">Riwayat Invoice</h2>
          </div>
          <ul className="divide-y">
            {invoices.map(inv => (
              <li key={inv.id} className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-sm font-semibold">{inv.number}</p>
                  <p className="text-xs text-muted-foreground">{formatTanggal(inv.periodStart)} – {formatTanggal(inv.periodEnd)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatRupiah(inv.amount)}</p>
                  <span className={cn("inline-block mt-1 text-xs font-medium rounded-full px-2 py-0.5", toneByStatus[inv.status])}>
                    {invoiceStatusLabel[inv.status]}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppShell>
  );
};

export default Billing;
