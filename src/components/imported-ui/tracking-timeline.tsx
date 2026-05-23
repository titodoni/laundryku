import { CheckCircle2, Circle, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderTimelineEntry } from "@/lib/order-timeline";

function formatTimelineDate(value: string | null) {
  if (!value) {
    return null;
  }

  return new Date(value).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ImportedTrackingTimeline({ entries }: { entries: OrderTimelineEntry[] }) {
  const lastVisibleIndex = entries.length - 1;

  return (
    <ol className="space-y-3">
      {entries.map((entry, index) => {
        const done = entry.state === "completed";
        const current = entry.state === "current";
        const formattedDate = formatTimelineDate(entry.occurredAt);

        return (
          <li key={entry.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              {done ? (
                <CheckCircle2 className="h-5 w-5 text-success" />
              ) : current ? (
                <CircleDot className="h-5 w-5 text-primary" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              {index < lastVisibleIndex ? (
                <div
                  className={cn(
                    "mt-1 h-8 w-px",
                    done || current ? "bg-primary/40" : "bg-border",
                  )}
                />
              ) : null}
            </div>
            <div className="pb-2">
              <p
                className={cn(
                  "text-sm font-semibold",
                  done || current ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {entry.label}
              </p>
              <p className="text-xs text-muted-foreground">{entry.debugLabel}</p>
              {formattedDate ? <p className="mt-1 text-xs text-muted-foreground">{formattedDate}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
