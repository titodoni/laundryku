import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { MetricCard } from "@/components/shared/MetricCard";
import { UpgradeCTA } from "@/components/shared/UpgradeCTA";
import { organizations, orders, expenses } from "@/lib/mock-data";
import { formatIDR } from "@/lib/status-labels";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download, Lock } from "lucide-react";

export default function Finance() {
  const { slug } = useParams();
  const org = organizations.find(o => o.slug === slug) ?? organizations[0];
  const free = org.plan === "FREE";

  const revenue = orders.filter(o => o.paymentStatus === "PAID").reduce((s,o) => s + o.paid, 0);
  const receivable = orders.reduce((s,o) => s + o.remaining, 0);
  const expensesToday = expenses.reduce((s,e) => s + e.amount, 0);
  const net = revenue - expensesToday;

  return (
    <DashboardLayout subtitle="Finance & akuntansi">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Ringkasan Finance</h2>
          <Button variant="outline" size="sm" disabled={free}>
            {free ? <Lock className="mr-1 h-4 w-4" /> : <Download className="mr-1 h-4 w-4" />}
            Export
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <MetricCard label="Kas Hari Ini" value={formatIDR(revenue)} tone="success" />
          <MetricCard label="Pendapatan" value={formatIDR(revenue)} hint="Hanya pembayaran lunas" />
          <MetricCard label="Pengeluaran" value={formatIDR(expensesToday)} tone="danger" />
          <MetricCard label="Laba Bersih" value={formatIDR(net)} tone={net >= 0 ? "success" : "danger"} />
          <MetricCard label="Piutang" value={formatIDR(receivable)} tone="warning" hint="DP & belum bayar" />
          <MetricCard label="DP Belum Lunas" value={formatIDR(orders.filter(o => o.paymentStatus==="PARTIAL").reduce((s,o)=>s+o.remaining,0))} tone="warning" />
        </div>

        {free && <UpgradeCTA message="Upgrade ke Pro untuk filter tanggal, riwayat penuh, dan export." />}

        <div className="grid gap-3 sm:grid-cols-2">
          <Link to={`/${slug}/dashboard/finance/expenses`} className="rounded-xl border border-border bg-card p-4 hover:border-primary">
            <p className="font-semibold">Pengeluaran</p>
            <p className="text-xs text-muted-foreground">Catat & kelola biaya operasional</p>
          </Link>
          <Link to={`/${slug}/dashboard/finance/income`} className="rounded-xl border border-border bg-card p-4 hover:border-primary">
            <p className="font-semibold">Income Ledger</p>
            <p className="text-xs text-muted-foreground">Riwayat pembayaran & piutang</p>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}