import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { staff, org } from "@/mocks/data";
import { roleLabel } from "@/lib/labels";
import { Plus, Lock, Phone } from "lucide-react";
import { UpgradeCTA } from "@/components/UpgradeCTA";

const Staff = () => {
  const isFree = (org as any).plan === "FREE";
  return (
    <AppShell title="Staff" subtitle="Kelola tim laundry Anda" right={
      <Button size="sm" className="bg-gradient-primary" disabled={isFree}><Plus className="h-4 w-4 mr-1" /> Staff</Button>
    }>
      <div className="container py-4 space-y-3 max-w-3xl">
        {isFree && (
          <div className="rounded-xl border border-primary/30 bg-primary-soft p-3 flex items-center gap-3">
            <Lock className="h-4 w-4 text-primary" />
            <p className="text-sm flex-1">Paket Free hanya mendukung 1 staff. Upgrade untuk menambah lebih banyak.</p>
          </div>
        )}
        <div className="space-y-2">
          {staff.map(s => (
            <div key={s.id} className="rounded-xl border bg-card p-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-primary text-primary-foreground grid place-items-center font-bold">
                {s.name.split(" ").map(p => p[0]).slice(0, 2).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold truncate">{s.name}</p>
                  {!s.active && <span className="text-[10px] bg-muted text-muted-foreground px-1.5 rounded">Nonaktif</span>}
                </div>
                <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
                  <Phone className="h-3 w-3" />{s.phone}
                </p>
              </div>
              <span className="text-xs font-semibold bg-primary-soft text-primary px-2.5 py-1 rounded-full">{roleLabel[s.role]}</span>
            </div>
          ))}
        </div>
        {isFree && <UpgradeCTA />}
      </div>
    </AppShell>
  );
};

export default Staff;
