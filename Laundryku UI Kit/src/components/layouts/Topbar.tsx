import { useParams, Link } from "react-router-dom";
import { organizations } from "@/lib/mock-data";
import { PlanBadge } from "@/components/shared/PlanBadge";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Topbar({ subtitle }: { subtitle?: string }) {
  const { slug } = useParams();
  const org = organizations.find(o => o.slug === slug) ?? organizations[0];
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-2 border-b border-border bg-card px-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="truncate text-sm font-semibold">{org.name}</h1>
          <PlanBadge plan={org.plan} />
        </div>
        {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary sm:flex">OW</div>
        <Button asChild variant="ghost" size="icon" className="tap-target">
          <Link to={`/${slug}/login`} title="Logout"><LogOut className="h-4 w-4" /></Link>
        </Button>
      </div>
    </header>
  );
}