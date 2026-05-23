import { cn } from "@/lib/utils";
import { orderStatusLabels, type OrderLifecycleStatus } from "@/lib/order-status";

export type ImportedOrderStatus = OrderLifecycleStatus;

export type ImportedPaymentStatus = "UNPAID" | "PARTIAL" | "PAID" | "REFUNDED";

const paymentStatusLabel: Record<ImportedPaymentStatus, string> = {
  UNPAID: "Belum Bayar",
  PARTIAL: "DP",
  PAID: "Lunas",
  REFUNDED: "Refund",
};

const tones: Record<string, string> = {
  RECEIVED: "bg-info/10 text-info",
  PROCESS: "bg-primary-soft text-primary",
  READY: "bg-success/10 text-success",
  PICKED_UP: "bg-muted text-muted-foreground",
  DELIVERED: "bg-success/10 text-success",
  CLOSED: "bg-muted text-muted-foreground",
  CANCELLED: "bg-destructive/10 text-destructive",
  UNPAID: "bg-destructive/10 text-destructive",
  PARTIAL: "bg-warning/10 text-warning",
  PAID: "bg-success/10 text-success",
  REFUNDED: "bg-muted text-muted-foreground",
};

export function ImportedStatusBadge({
  kind,
  status,
  className,
}: {
  kind: "order" | "payment";
  status: ImportedOrderStatus | ImportedPaymentStatus;
  className?: string;
}) {
  const label =
    kind === "order"
      ? orderStatusLabels[status as ImportedOrderStatus]
      : paymentStatusLabel[status as ImportedPaymentStatus];

  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[status], className)}>
      {label}
    </span>
  );
}
