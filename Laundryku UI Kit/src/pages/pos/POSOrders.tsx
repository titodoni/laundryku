import { POSLayout } from "@/components/layouts/POSLayout";
import { orders, customerById } from "@/lib/mock-data";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PaymentStatusBadge } from "@/components/shared/PaymentStatusBadge";
import { formatIDR, formatTimeID } from "@/lib/status-labels";

export default function POSOrders() {
  return (
    <POSLayout>
      <div className="container max-w-2xl space-y-3 py-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Order Hari Ini</h2>
          <span className="text-xs text-muted-foreground">{orders.length} order</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
          {["Semua","Diterima","Dicuci","Siap Diambil","Belum Lunas"].map((f, i) => (
            <button key={f} className={`shrink-0 rounded-full border px-3 py-1.5 ${i===0 ? "border-primary bg-primary-soft text-primary font-medium" : "border-border bg-card text-muted-foreground"}`}>{f}</button>
          ))}
        </div>
        <div className="space-y-2">
          {orders.map(o => {
            const c = customerById(o.customerId);
            return (
              <div key={o.id} className="rounded-xl border border-border bg-card p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{o.orderNumber}</p>
                    <p className="truncate text-xs text-muted-foreground">{c?.name} · {formatTimeID(o.createdAt)}</p>
                  </div>
                  <StatusBadge status={o.status} />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <PaymentStatusBadge status={o.paymentStatus} />
                  <div className="text-right text-xs">
                    <p className="font-semibold">{formatIDR(o.total)}</p>
                    {o.remaining > 0 && <p className="text-warning">Sisa {formatIDR(o.remaining)}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </POSLayout>
  );
}