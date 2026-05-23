import { cn } from "@/lib/utils";
import { Crown, Sparkles } from "lucide-react";
import type { Plan, SubscriptionStatus } from "@/mocks/types";
import { planLabel, subscriptionStatusLabel } from "@/lib/labels";

export function PlanBadge({ plan, status, className }: { plan: Plan; status?: SubscriptionStatus; className?: string }) {
  const isTrial = status === "TRIALING";
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
      plan === "PRO" ? "bg-gradient-primary text-primary-foreground shadow-soft" : "bg-muted text-muted-foreground",
      className
    )}>
      {plan === "PRO" ? <Crown className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
      {isTrial ? `Trial ${planLabel[plan]}` : planLabel[plan]}
      {status && status !== "ACTIVE" && status !== "TRIALING" && (
        <span className="opacity-80">· {subscriptionStatusLabel[status]}</span>
      )}
    </span>
  );
}
