import { Link } from "react-router-dom";
import { StatusBadge } from "./StatusBadge";
import { formatRupiah, formatTanggalJam, formatJam } from "@/lib/format";
import { ChevronRight, Clock } from "lucide-react";
import type { Order } from "@/mocks/types";

export function OrderCard({ order, basePath = "/melati-clean/pos/receipt" }: { order: Order; basePath?: string }) {
  const totalKg = order.items.reduce((s, i) => s + (i.unit === "kg" ? i.qty : 0), 0);
  return (
    <Link to={`${basePath}/${order.code}`} className="group block rounded-xl border bg-card p-3 shadow-soft hover:border-primary/40 hover:shadow-elegant transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-primary">{order.code}</span>
            <StatusBadge kind="order" status={order.status} />
          </div>
          <p className="mt-1 text-sm font-semibold truncate">{order.customerName}</p>
          <p className="text-xs text-muted-foreground truncate">
            {order.items[0].serviceName} · {totalKg > 0 ? `${totalKg} kg` : `${order.items[0].qty} pcs`}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-bold">{formatRupiah(order.total)}</p>
          <StatusBadge kind="payment" status={order.paymentStatus} className="mt-1" />
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatTanggalJam(order.createdAt)}</span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" /> Estimasi selesai {formatJam(order.estimatedReadyAt)}
          <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition" />
        </span>
      </div>
    </Link>
  );
}
