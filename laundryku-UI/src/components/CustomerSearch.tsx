import { Search, UserPlus, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
import type { Customer } from "@/mocks/types";
import { cn } from "@/lib/utils";

export function CustomerSearch({ customers, value, onChange }: { customers: Customer[]; value?: Customer; onChange: (c: Customer | undefined) => void }) {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    if (!q.trim()) return [];
    const lo = q.toLowerCase();
    return customers.filter(c => c.name.toLowerCase().includes(lo) || c.phone.includes(q)).slice(0, 5);
  }, [q, customers]);

  if (value) {
    return (
      <div className="rounded-xl border-2 border-primary bg-primary-soft p-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold truncate">{value.name}</p>
          <p className="text-xs text-muted-foreground inline-flex items-center gap-1"><Phone className="h-3 w-3" />{value.phone}</p>
        </div>
        <button onClick={() => onChange(undefined)} className="text-xs text-primary font-semibold whitespace-nowrap">Ganti</button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Cari nama atau nomor HP..." className="pl-9 h-11" />
      </div>
      {results.length > 0 && (
        <div className="rounded-xl border bg-card divide-y overflow-hidden">
          {results.map(c => (
            <button key={c.id} onClick={() => { onChange(c); setQ(""); }} className="w-full text-left p-3 hover:bg-muted transition">
              <p className="font-medium text-sm">{c.name}</p>
              <p className="text-xs text-muted-foreground">{c.phone}</p>
            </button>
          ))}
        </div>
      )}
      {q && results.length === 0 && (
        <button className={cn("w-full rounded-xl border-2 border-dashed border-primary/40 p-3 text-sm font-semibold text-primary inline-flex items-center justify-center gap-2")}>
          <UserPlus className="h-4 w-4" /> Tambah pelanggan baru "{q}"
        </button>
      )}
    </div>
  );
}
