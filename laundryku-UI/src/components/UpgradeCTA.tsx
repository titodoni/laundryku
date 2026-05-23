import { Crown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function UpgradeCTA({ compact, className, to = "/melati-clean/dashboard/billing" }: { compact?: boolean; className?: string; to?: string }) {
  if (compact) {
    return (
      <Link to={to} className={cn("flex items-center gap-2 rounded-xl bg-gradient-primary text-primary-foreground px-3 py-2 shadow-glow", className)}>
        <Crown className="h-4 w-4 shrink-0" />
        <span className="text-xs font-semibold">Upgrade Pro</span>
      </Link>
    );
  }
  return (
    <div className={cn("rounded-2xl bg-gradient-primary text-primary-foreground p-4 shadow-glow", className)}>
      <div className="flex items-center gap-2">
        <Crown className="h-5 w-5" />
        <p className="font-bold font-display">Upgrade ke Pro</p>
      </div>
      <p className="mt-1.5 text-sm opacity-95">Pesanan tak terbatas, multi-staff, laporan lengkap, ekspor data, dan cabang tak terbatas.</p>
      <Button asChild variant="secondary" size="sm" className="mt-3 w-full font-semibold">
        <Link to={to}><Zap className="h-4 w-4 mr-1" /> Aktifkan Pro</Link>
      </Button>
    </div>
  );
}
