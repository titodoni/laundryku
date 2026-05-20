import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { orders } from "@/lib/mock-data";
import { PaymentStatusBadge } from "@/components/shared/PaymentStatusBadge";
import { formatIDR, formatDateID } from "@/lib/status-labels";

export default function Income() {
  return (
    <DashboardLayout subtitle="Income ledger">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Pembayaran & Piutang</h2>
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr><th className="px-4 py-3">Tanggal</th><th className="px-4 py-3">Order</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Dibayar</th><th className="px-4 py-3 text-right">Sisa</th></tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-t border-border">
                  <td className="px-4 py-3 text-muted-foreground">{formatDateID(o.createdAt)}</td>
                  <td className="px-4 py-3 font-medium">{o.orderNumber}</td>
                  <td className="px-4 py-3"><PaymentStatusBadge status={o.paymentStatus} /></td>
                  <td className="px-4 py-3 text-right tabular-nums text-success">{formatIDR(o.paid)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-warning">{formatIDR(o.remaining)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}