import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function MetricCard({
  label, value, icon, hint, tone = "default", blurred = false, className,
}: {
  label: string; value: ReactNode; icon?: ReactNode; hint?: string;
  tone?: "default" | "success" | "warning" | "danger" | "info";
  blurred?: boolean; className?: string;
}) {
  const toneCls = {
    default: "text-foreground",
    success: "text-success",
    warning: "text-warning",
    danger: "text-destructive",
    info: "text-info",
  }[tone];
  return (
    <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <div className={cn("mt-2 text-xl font-semibold tabular-nums", toneCls, blurred && "select-none blur-sm")}>
        {value}
      </div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}