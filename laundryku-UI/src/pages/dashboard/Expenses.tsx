import { AppShell } from "@/components/AppShell";
import { FinanceTabs } from "./Finance";
import { Button } from "@/components/ui/button";
import { expenses } from "@/mocks/data";
import { expenseCategoryLabel } from "@/lib/labels";
import { formatRupiah, formatTanggalRelatif } from "@/lib/format";
import { Plus } from "lucide-react";

const Expenses = () => {
  return (
    <AppShell title="Keuangan" subtitle="Catat pengeluaran" right={
      <Button size="sm" className="bg-gradient-primary"><Plus className="h-4 w-4 mr-1" /> Pengeluaran</Button>
    }>
      <FinanceTabs />
      <div className="container py-4 max-w-4xl space-y-2">
        {expenses.map(e => (
          <div key={e.id} className="rounded-xl border bg-card p-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-destructive/15 text-destructive grid place-items-center font-bold text-xs">
              {expenseCategoryLabel[e.category].slice(0, 3).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{e.note}</p>
              <p className="text-xs text-muted-foreground">{expenseCategoryLabel[e.category]} · {formatTanggalRelatif(e.createdAt)}</p>
            </div>
            <p className="font-bold text-destructive whitespace-nowrap">-{formatRupiah(e.amount)}</p>
          </div>
        ))}
      </div>
    </AppShell>
  );
};

export default Expenses;
