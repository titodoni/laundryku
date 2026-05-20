import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/mock-schema";
import { orderStatusLabel } from "@/lib/status-labels";

const styles: Record<OrderStatus, string> = {
  RECEIVED: "bg-info-soft text-info",
  WASHING: "bg-info-soft text-info",
  DRYING: "bg-info-soft text-info",
  IRONING: "bg-warning-soft text-warning",
  PACKING: "bg-warning-soft text-warning",
  READY: "bg-success-soft text-success",
  PICKED_UP: "bg-muted text-muted-foreground",
  DELIVERED: "bg-success-soft text-success",
  CANCELLED: "bg-destructive-soft text-destructive",
};

export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", styles[status], className)}>
      {orderStatusLabel[status]}
    </span>
  );
}