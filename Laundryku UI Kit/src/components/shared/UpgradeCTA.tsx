import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";

export function UpgradeCTA({ message }: { message?: string }) {
  const { slug = "laundry-melati" } = useParams();
  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-primary/20 bg-primary-soft p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-primary/10 p-2 text-primary"><Crown className="h-5 w-5" /></div>
        <div>
          <p className="text-sm font-semibold text-foreground">Upgrade ke Pro</p>
          <p className="text-xs text-muted-foreground">{message ?? "Buka order unlimited, staff unlimited, analytics & finance penuh."}</p>
        </div>
      </div>
      <Button asChild size="sm"><Link to={`/${slug}/dashboard/billing`}>Upgrade Sekarang</Link></Button>
    </div>
  );
}