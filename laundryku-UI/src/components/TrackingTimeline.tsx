import { ORDER_FLOW, orderStatusLabel } from "@/lib/labels";
import type { OrderStatus } from "@/mocks/types";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function TrackingTimeline({ current }: { current: OrderStatus }) {
  const currentIdx = ORDER_FLOW.indexOf(current);
  return (
    <ol className="relative space-y-4">
      {ORDER_FLOW.map((s, i) => {
        const done = i <= currentIdx;
        const active = i === currentIdx;
        return (
          <li key={s} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2",
                done ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border",
                active && "ring-4 ring-primary/20")}>
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < ORDER_FLOW.length - 1 && <div className={cn("w-0.5 flex-1 my-1", done ? "bg-primary" : "bg-border")} style={{ minHeight: 16 }} />}
            </div>
            <div className="pb-3 pt-1">
              <p className={cn("font-semibold text-sm", done ? "text-foreground" : "text-muted-foreground")}>{orderStatusLabel[s]}</p>
              {active && <p className="text-xs text-primary mt-0.5">Sedang berlangsung</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
