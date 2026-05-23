import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { branches } from "@/mocks/data";
import { Plus, MapPin, Phone, Pencil } from "lucide-react";
import { SettingsTabs } from "./SettingsOrg";

const SettingsBranch = () => {
  return (
    <AppShell title="Pengaturan" subtitle="Kelola cabang" right={
      <Button size="sm" className="bg-gradient-primary"><Plus className="h-4 w-4 mr-1" /> Cabang</Button>
    }>
      <SettingsTabs />
      <div className="container py-4 max-w-2xl space-y-3">
        {branches.map(b => (
          <div key={b.id} className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{b.name}</p>
                <p className="text-sm text-muted-foreground inline-flex items-start gap-1.5 mt-1.5"><MapPin className="h-4 w-4 shrink-0 mt-0.5" /> {b.address}</p>
                <p className="text-sm text-muted-foreground inline-flex items-center gap-1.5 mt-1"><Phone className="h-4 w-4" /> {b.phone}</p>
              </div>
              <button className="p-2 rounded-lg hover:bg-muted"><Pencil className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
};

export default SettingsBranch;
