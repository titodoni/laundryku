import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { customers } from "@/mocks/data";
import { formatRupiah, formatTanggalRelatif } from "@/lib/format";
import { Plus, Search, Phone } from "lucide-react";

const Customers = () => {
  return (
    <AppShell title="Pelanggan" subtitle={`${customers.length} pelanggan terdaftar`} right={
      <Button size="sm" className="bg-gradient-primary"><Plus className="h-4 w-4 mr-1" /> Pelanggan</Button>
    }>
      <div className="container py-4 space-y-3 max-w-3xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari nama atau nomor HP..." className="pl-9 h-11" />
        </div>
        <div className="space-y-2">
          {customers.map(c => (
            <div key={c.id} className="rounded-xl border bg-card p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground inline-flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone}</p>
                  {c.address && <p className="text-xs text-muted-foreground mt-0.5">{c.address}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-primary">{formatRupiah(c.totalSpent)}</p>
                  <p className="text-xs text-muted-foreground">{c.totalOrders} pesanan</p>
                </div>
              </div>
              {c.lastOrderAt && (
                <p className="text-[11px] text-muted-foreground mt-2 pt-2 border-t">Terakhir order {formatTanggalRelatif(c.lastOrderAt)}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
};

export default Customers;
