import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { services } from "@/lib/mock-data";
import { categoryLabel, formatIDR } from "@/lib/status-labels";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil } from "lucide-react";

export default function Services() {
  return (
    <DashboardLayout subtitle="Layanan & harga">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Layanan</h2>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Tambah Layanan</Button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(s => (
            <div key={s.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{s.name}</p>
                  <span className="mt-1 inline-block rounded-md bg-primary-soft px-2 py-0.5 text-[11px] font-medium text-primary">
                    {categoryLabel[s.category]}
                  </span>
                </div>
                <Switch defaultChecked={s.active} />
              </div>
              <div className="mt-3 flex items-end justify-between">
                <div>
                  <p className="text-lg font-bold tabular-nums">{formatIDR(s.price)}<span className="text-xs font-normal text-muted-foreground">/{s.unit}</span></p>
                  <p className="text-xs text-muted-foreground">Min. {s.minQty} {s.unit}</p>
                </div>
                <Button size="icon" variant="ghost"><Pencil className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}