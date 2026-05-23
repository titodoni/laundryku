import { AppShell } from "@/components/AppShell";
import { FinanceSummaryCards } from "@/components/FinanceSummaryCards";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { expenses, orders, org } from "@/mocks/data";
import { formatRupiah, formatTanggalRelatif } from "@/lib/format";
import { Download, Lock, TrendingUp, TrendingDown } from "lucide-react";
import { expenseCategoryLabel } from "@/lib/labels";

const tabs = [
  { to: "/melati-clean/dashboard/finance", label: "Ringkasan" },
  { to: "/melati-clean/dashboard/finance/income", label: "Pemasukan" },
  { to: "/melati-clean/dashboard/finance/expenses", label: "Pengeluaran" },
];

export function FinanceTabs() {
  const { pathname } = useLocation();
  return (
    <div className="border-b">
      <div className="container flex gap-1 overflow-x-auto">
        {tabs.map(t => {
          const active = pathname === t.to;
          return (
            <Link key={t.to} to={t.to}
              className={cn("px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px",
                active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
              {t.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

const Finance = () => {
  const isFree = (org as any).plan === "FREE";
  const income = orders.reduce((s, o) => s + o.paid, 0);
  const expense = expenses.reduce((s, e) => s + e.amount, 0);
  return (
    <AppShell title="Keuangan" subtitle={isFree ? "Hari ini saja (paket Free)" : "Ringkasan 30 hari terakhir"} right={
      <Button size="sm" variant="outline" disabled={isFree}><Download className="h-4 w-4 mr-1" /> Ekspor</Button>
    }>
      <FinanceTabs />
      <div className="container py-4 space-y-4 max-w-4xl">
        <FinanceSummaryCards income={income} expense={expense} orders={orders.length} />

        <div className="rounded-xl border bg-card">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold font-display">Transaksi Terbaru</h2>
            {isFree && <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><Lock className="h-3 w-3" /> Riwayat penuh di Pro</span>}
          </div>
          <ul className="divide-y">
            {orders.slice(0, 4).map(o => (
              <li key={o.id} className="p-3 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-success/15 text-success grid place-items-center"><TrendingUp className="h-4 w-4" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{o.customerName}</p>
                  <p className="text-xs text-muted-foreground">{o.code} · {formatTanggalRelatif(o.createdAt)}</p>
                </div>
                <p className="font-bold text-success whitespace-nowrap">+{formatRupiah(o.paid)}</p>
              </li>
            ))}
            {expenses.slice(0, 2).map(e => (
              <li key={e.id} className="p-3 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-destructive/15 text-destructive grid place-items-center"><TrendingDown className="h-4 w-4" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{e.note}</p>
                  <p className="text-xs text-muted-foreground">{expenseCategoryLabel[e.category]} · {formatTanggalRelatif(e.createdAt)}</p>
                </div>
                <p className="font-bold text-destructive whitespace-nowrap">-{formatRupiah(e.amount)}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppShell>
  );
};

export default Finance;
