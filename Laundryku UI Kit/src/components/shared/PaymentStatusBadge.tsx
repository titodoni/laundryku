import { cn } from "@/lib/utils";
import type { PaymentStatus } from "@/types/mock-schema";
import { paymentStatusLabel } from "@/lib/status-labels";

const styles: Record<PaymentStatus, string> = {
  PAID: "bg-success-soft text-success",
  PARTIAL: "bg-warning-soft text-warning",
  UNPAID: "bg-destructive-soft text-destructive",
  REFUNDED: "bg-muted text-muted-foreground",
};

export function PaymentStatusBadge({ status, className }: { status: PaymentStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", styles[status], className)}>
      {paymentStatusLabel[status]}
    </span>
  );
}