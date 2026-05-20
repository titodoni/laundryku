import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { customers } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { formatDateID } from "@/lib/status-labels";

export default function Customers() {
  return (
    <DashboardLayout subtitle="Database pelanggan">
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">Pelanggan</h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari nama / nomor HP" className="pl-9" />
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {customers.map(c => (
            <div key={c.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.phone}</p>
                </div>
                <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary">{c.totalOrders} order</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Terakhir order: {c.lastOrderAt ? formatDateID(c.lastOrderAt) : "—"}
              </p>
              {c.tags && c.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {c.tags.map(t => <span key={t} className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{t}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}