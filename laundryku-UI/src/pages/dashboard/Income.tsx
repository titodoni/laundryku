import { AppShell } from "@/components/AppShell";
import { FinanceTabs } from "./Finance";
import { orders } from "@/mocks/data";
import { formatRupiah, formatTanggalJam } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";

const Income = () => {
  return (
    <AppShell title="Keuangan" subtitle="Pemasukan dari pesanan">
      <FinanceTabs />
      <div className="container py-4 max-w-4xl space-y-2">
        {orders.map(o => (
          <div key={o.id} className="rounded-xl border bg-card p-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-mono text-xs font-semibold text-primary">{o.code}</p>
                <StatusBadge kind="payment" status={o.paymentStatus} />
              </div>
              <p className="text-sm font-medium truncate mt-1">{o.customerName}</p>
              <p className="text-xs text-muted-foreground">{formatTanggalJam(o.createdAt)}</p>
            </div>
            <p className="font-bold text-success whitespace-nowrap">+{formatRupiah(o.paid)}</p>
          </div>
        ))}
      </div>
    </AppShell>
  );
};

export default Income;
