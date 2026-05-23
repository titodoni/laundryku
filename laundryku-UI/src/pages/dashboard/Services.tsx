import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { services } from "@/mocks/data";
import { serviceTypeLabel } from "@/lib/labels";
import { formatRupiah } from "@/lib/format";
import { Plus, Pencil } from "lucide-react";

const Services = () => {
  return (
    <AppShell title="Layanan" subtitle="Kelola daftar layanan dan harga" right={
      <Button size="sm" className="bg-gradient-primary"><Plus className="h-4 w-4 mr-1" /> Layanan</Button>
    }>
      <div className="container py-4 space-y-2 max-w-3xl">
        {services.map(s => {
          const price = s.price.pricePerKg ?? s.price.pricePerItem ?? 0;
          const unit = s.price.pricePerKg ? "/kg" : "/pcs";
          return (
            <div key={s.id} className="rounded-xl border bg-card p-3 flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary-soft text-primary grid place-items-center font-bold text-xs shrink-0">
                {serviceTypeLabel[s.type].slice(0, 3).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold truncate">{s.name}</p>
                  <span className="text-[10px] font-semibold uppercase bg-primary-soft text-primary px-1.5 rounded">{serviceTypeLabel[s.type]}</span>
                </div>
                <p className="text-xs text-muted-foreground">{s.description} · {s.price.estimationHours} jam</p>
                <p className="text-sm font-bold text-primary mt-0.5">{formatRupiah(price)}<span className="font-normal text-muted-foreground text-xs">{unit}</span></p>
              </div>
              <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground"><Pencil className="h-4 w-4" /></button>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
};

export default Services;
