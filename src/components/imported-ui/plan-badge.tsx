import { cn } from "@/lib/utils";
import { Crown, Sparkles } from "lucide-react";

type Plan = "FREE" | "PRO";
type SubscriptionStatus = "TRIALING" | "ACTIVE" | "LIMITED" | "PAST_DUE" | "CANCELLED" | "EXPIRED";

const planLabel: Record<Plan, string> = { FREE: "Free", PRO: "Pro" };
const statusLabel: Record<SubscriptionStatus, string> = {
  TRIALING: "Masa Uji Coba",
  ACTIVE: "Aktif",
  LIMITED: "Terbatas",
  PAST_DUE: "Tertunda",
  CANCELLED: "Dibatalkan",
  EXPIRED: "Kedaluwarsa",
};

export function ImportedPlanBadge({
  plan,
  status,
  className,
}: {
  plan: Plan;
  status?: SubscriptionStatus;
  className?: string;
}) {
  const isTrial = status === "TRIALING";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        plan === "PRO" ? "bg-gradient-primary text-primary-foreground shadow-soft" : "bg-muted text-muted-foreground",
        className,
      )}
    >
      {plan === "PRO" ? <Crown className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
      {isTrial ? `Trial ${planLabel[plan]}` : planLabel[plan]}
      {status && status !== "ACTIVE" && status !== "TRIALING" ? <span className="opacity-80">- {statusLabel[status]}</span> : null}
    </span>
  );
}
