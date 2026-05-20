import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { expenses } from "@/lib/mock-data";
import { expenseCategoryLabel, formatIDR, formatDateID } from "@/lib/status-labels";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Expenses() {
  return (
    <DashboardLayout subtitle="Pengeluaran">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Pengeluaran</h2>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Tambah Pengeluaran</Button>
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr><th className="px-4 py-3">Tanggal</th><th className="px-4 py-3">Kategori</th><th className="px-4 py-3">Catatan</th><th className="px-4 py-3 text-right">Jumlah</th></tr>
            </thead>
            <tbody>
              {expenses.map(e => (
                <tr key={e.id} className="border-t border-border">
                  <td className="px-4 py-3 text-muted-foreground">{formatDateID(e.date)}</td>
                  <td className="px-4 py-3"><span className="rounded-md bg-muted px-2 py-0.5 text-xs">{expenseCategoryLabel[e.category]}</span></td>
                  <td className="px-4 py-3">{e.notes ?? "—"}</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatIDR(e.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}