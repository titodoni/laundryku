import { cn } from "@/lib/utils";
import { orderStatusLabel, paymentStatusLabel, paymentChannelLabel } from "@/lib/labels";
import type { OrderStatus, PaymentStatus, PaymentChannel } from "@/mocks/types";

type Variant =
  | { kind: "order"; status: OrderStatus }
  | { kind: "payment"; status: PaymentStatus }
  | { kind: "channel"; status: PaymentChannel };

const orderTone: Record<OrderStatus, string> = {
  RECEIVED: "bg-muted text-muted-foreground",
  WASHING: "bg-info/15 text-info",
  DRYING: "bg-info/15 text-info",
  IRONING: "bg-warning/15 text-warning",
  PACKING: "bg-warning/15 text-warning",
  READY: "bg-success/15 text-success",
  PICKED_UP: "bg-primary/10 text-primary",
  DELIVERED: "bg-primary/10 text-primary",
};

const payTone: Record<PaymentStatus, string> = {
  UNPAID: "bg-destructive/10 text-destructive",
  PARTIAL: "bg-warning/15 text-warning",
  PAID: "bg-success/15 text-success",
  REFUNDED: "bg-muted text-muted-foreground",
};

const channelTone: Record<PaymentChannel, string> = {
  CASH: "bg-success/15 text-success",
  TRANSFER: "bg-info/15 text-info",
  QRIS: "bg-primary/10 text-primary",
};

export function StatusBadge(props: Variant & { className?: string }) {
  let label = "", tone = "";
  if (props.kind === "order") { label = orderStatusLabel[props.status]; tone = orderTone[props.status]; }
  else if (props.kind === "payment") { label = paymentStatusLabel[props.status]; tone = payTone[props.status]; }
  else { label = paymentChannelLabel[props.status]; tone = channelTone[props.status]; }
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap", tone, props.className)}>
      {label}
    </span>
  );
}
