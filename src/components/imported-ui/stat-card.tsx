import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type ImportedStatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "primary" | "success" | "warning" | "destructive";
  className?: string;
};

const tones: Record<NonNullable<ImportedStatCardProps["tone"]>, string> = {
  default: "bg-card",
  primary: "bg-primary-soft",
  success: "bg-success/10",
  warning: "bg-warning/10",
  destructive: "bg-destructive/10",
};

export function ImportedStatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  className,
}: ImportedStatCardProps) {
  return (
    <div className={cn("rounded-xl border bg-card p-4 shadow-soft", className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 truncate font-display text-xl font-bold tracking-tight">{value}</p>
          {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        {Icon ? (
          <div className={cn("shrink-0 rounded-lg p-2", tones[tone])}>
            <Icon className="h-4 w-4 text-primary" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
