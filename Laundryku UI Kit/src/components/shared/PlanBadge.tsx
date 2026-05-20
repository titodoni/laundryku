import { Crown, Sparkles } from "lucide-react";
import type { PlanType } from "@/types/mock-schema";
import { cn } from "@/lib/utils";

export function PlanBadge({ plan, className }: { plan: PlanType; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
      plan === "PRO" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
      className)}>
      {plan === "PRO" ? <Crown className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
      {plan === "PRO" ? "Pro" : "Free"}
    </span>
  );
}