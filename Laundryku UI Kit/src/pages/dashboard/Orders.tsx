import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { orders, customerById } from "@/lib/mock-data";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PaymentStatusBadge } from "@/components/shared/PaymentStatusBadge";
import { formatIDR, formatDateID } from "@/lib/status-labels";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Orders() {
  return (
    <DashboardLayout subtitle="Semua pesanan">
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">Daftar Order</h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari nomor / pelanggan" className="pl-9" />
          </div>
        </div>

        {/* Mobile cards */}
        <div className="space-y-2 lg:hidden">
          {orders.map(o => {
            const c = customerById(o.customerId);
            return (
              <div key={o.id} className="rounded-xl border border-border bg-card p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{o.orderNumber}</p>
                    <p className="truncate text-xs text-muted-foreground">{c?.name}</p>
                  </div>
                  <StatusBadge status={o.status} />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <PaymentStatusBadge status={o.paymentStatus} />
                  <span className="font-semibold">{formatIDR(o.total)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-hidden rounded-xl border border-border bg-card lg:block">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">No. Order</th><th className="px-4 py-3">Pelanggan</th>
                <th className="px-4 py-3">Status</th><th className="px-4 py-3">Bayar</th>
                <th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => {
                const c = customerById(o.customerId);
                return (
                  <tr key={o.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{o.orderNumber}</td>
                    <td className="px-4 py-3">{c?.name}</td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3"><PaymentStatusBadge status={o.paymentStatus} /></td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatIDR(o.total)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDateID(o.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}