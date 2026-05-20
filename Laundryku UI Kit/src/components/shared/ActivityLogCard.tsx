import type { ActivityLog } from "@/types/mock-schema";
import { formatTimeID, formatDateID } from "@/lib/status-labels";

const actionLabel: Record<string, string> = {
  "order.created": "Order baru",
  "order.status_changed": "Status order diubah",
  "payment.received": "Pembayaran diterima",
  "expense.created": "Pengeluaran ditambahkan",
  "subscription.updated": "Langganan diperbarui",
};

export function ActivityLogCard({ log }: { log: ActivityLog }) {
  return (
    <li className="flex items-start gap-3 border-b border-border py-3 last:border-0">
      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-foreground">
          <span className="font-medium">{log.actor}</span>{" "}
          <span className="text-muted-foreground">{actionLabel[log.action] ?? log.action}</span>{" "}
          <span className="font-medium">{log.target}</span>
        </p>
        {log.details && <p className="text-xs text-muted-foreground">{log.details}</p>}
      </div>
      <span className="shrink-0 text-xs text-muted-foreground">
        {formatDateID(log.timestamp)} · {formatTimeID(log.timestamp)}
      </span>
    </li>
  );
}