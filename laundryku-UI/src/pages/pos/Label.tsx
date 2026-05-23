import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { orders } from "@/mocks/data";
import { useParams } from "react-router-dom";
import { Printer } from "lucide-react";
import { formatTanggal, formatJam } from "@/lib/format";

const Label = () => {
  const { code } = useParams();
  const order = orders.find(o => o.code === code) ?? orders[0];
  const totalKg = order.items.reduce((s, i) => s + (i.unit === "kg" ? i.qty : 0), 0);

  return (
    <AppShell title="Label Kemasan" subtitle={order.code} back="back" showSidebar={false}>
      <div className="container py-4 max-w-sm space-y-3 print:p-0 print:max-w-none">
        <div className="rounded-xl border-2 border-foreground bg-white p-4 mx-auto max-w-[320px] print:border-2 print:shadow-none">
          <div className="text-center border-b-2 border-dashed pb-2 mb-2">
            <p className="font-display font-extrabold text-lg">MELATI CLEAN</p>
            <p className="text-[10px]">Label Kemasan</p>
          </div>
          <div className="space-y-1">
            <p className="font-mono font-extrabold text-xl text-center">{order.code}</p>
            <div className="text-center bg-foreground text-background py-2 rounded">
              <p className="font-display font-bold text-2xl">{order.customerName}</p>
              <p className="text-xs">{order.customerPhone}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs pt-2">
              <div className="rounded border p-2">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Berat</p>
                <p className="font-bold text-base">{totalKg || order.items[0].qty} {order.items[0].unit}</p>
              </div>
              <div className="rounded border p-2">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Layanan</p>
                <p className="font-semibold text-xs leading-tight">{order.items[0].serviceName}</p>
              </div>
            </div>
            <div className="rounded border p-2 text-xs">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Estimasi Selesai</p>
              <p className="font-bold">{formatTanggal(order.estimatedReadyAt)} · {formatJam(order.estimatedReadyAt)}</p>
            </div>
            {order.note && (
              <div className="rounded border p-2 text-xs">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Catatan</p>
                <p>{order.note}</p>
              </div>
            )}
            <div className="text-center pt-2">
              <div className="mx-auto h-20 w-20 bg-foreground" style={{
                backgroundImage: "repeating-linear-gradient(0deg, hsl(var(--background)) 0 2px, transparent 2px 4px), repeating-linear-gradient(90deg, hsl(var(--background)) 0 2px, transparent 2px 4px)"
              }} />
              <p className="text-[10px] mt-1 font-mono">Scan untuk lacak</p>
            </div>
          </div>
        </div>
        <Button onClick={() => window.print()} className="w-full h-11 bg-gradient-primary shadow-glow print:hidden">
          <Printer className="h-4 w-4 mr-1" /> Cetak Label
        </Button>
      </div>
    </AppShell>
  );
};

export default Label;
