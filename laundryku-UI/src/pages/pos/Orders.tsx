import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { OrderCard } from "@/components/OrderCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { orders } from "@/mocks/data";
import { orderStatusLabel } from "@/lib/labels";
import { Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/mocks/types";

const filters: ("ALL" | OrderStatus)[] = ["ALL", "RECEIVED", "WASHING", "IRONING", "READY", "PICKED_UP"];

const Orders = () => {
  const [active, setActive] = useState<typeof filters[number]>("ALL");
  const [q, setQ] = useState("");
  const filtered = orders.filter(o =>
    (active === "ALL" || o.status === active) &&
    (q === "" || o.code.toLowerCase().includes(q.toLowerCase()) || o.customerName.toLowerCase().includes(q.toLowerCase()))
  );
  return (
    <AppShell title="Pesanan Hari Ini" subtitle={`${orders.length} pesanan aktif`} right={
      <Button asChild size="sm" className="bg-gradient-primary"><Link to="/melati-clean/pos"><Plus className="h-4 w-4 mr-1" /> Baru</Link></Button>
    }>
      <div className="container py-4 max-w-3xl space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Cari nomor pesanan atau pelanggan..." className="pl-9 h-11" />
        </div>
        <div className="flex gap-1.5 overflow-x-auto -mx-1 px-1 pb-1">
          {filters.map(f => (
            <button key={f} onClick={() => setActive(f)}
              className={cn("px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition",
                active === f ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground")}>
              {f === "ALL" ? "Semua" : orderStatusLabel[f]}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {filtered.map(o => <OrderCard key={o.id} order={o} />)}
        </div>
      </div>
    </AppShell>
  );
};

export default Orders;
