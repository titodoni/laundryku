import { AlertCircle, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import type { Organization } from "@/types/mock-schema";

export function PlanBanner({ org }: { org: Organization }) {
  const { slug = org.slug } = useParams();
  if (org.plan === "PRO" && org.status === "ACTIVE") return null;

  if (org.status === "TRIALING") {
    const days = org.trialEndsAt
      ? Math.max(0, Math.ceil((new Date(org.trialEndsAt).getTime() - Date.now()) / 86400000))
      : 0;
    return (
      <div className="flex flex-col items-start gap-2 rounded-lg border border-primary/20 bg-primary-soft px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Crown className="h-4 w-4 text-primary" />
          <span className="font-medium text-foreground">Masa trial Pro</span>
          <span className="text-muted-foreground">— {days} hari tersisa</span>
        </div>
        <Button asChild size="sm"><Link to={`/${slug}/dashboard/billing`}>Upgrade ke Pro</Link></Button>
      </div>
    );
  }

  if (org.status === "LIMITED") {
    return (
      <div className="flex flex-col items-start gap-2 rounded-lg border border-warning/30 bg-warning-soft px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-warning-foreground">
          <AlertCircle className="h-4 w-4 text-warning" />
          <span className="font-medium">Mode terbatas aktif</span>
          <span className="text-muted-foreground">— maksimal 10 order/hari, 1 staff.</span>
        </div>
        <Button asChild size="sm"><Link to={`/${slug}/dashboard/billing`}>Upgrade</Link></Button>
      </div>
    );
  }
  return null;
}