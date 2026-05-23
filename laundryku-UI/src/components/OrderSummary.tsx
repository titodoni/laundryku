import { formatRupiah, formatKg } from "@/lib/format";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { OrderItem } from "@/mocks/types";

export function OrderSummary({ items, onUpdate, onRemove, discount = 0 }: {
  items: OrderItem[]; onUpdate?: (id: string, qty: number) => void; onRemove?: (id: string) => void; discount?: number;
}) {
  const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
  const total = subtotal - discount;
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="p-3 border-b bg-muted/40">
        <p className="font-semibold text-sm">Ringkasan Pesanan</p>
      </div>
      <div className="divide-y">
        {items.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">Belum ada layanan dipilih</p>
        )}
        {items.map(item => (
          <div key={item.id} className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{item.serviceName}</p>
                <p className="text-xs text-muted-foreground">{formatRupiah(item.pricePerUnit)}/{item.unit}</p>
              </div>
              <p className="font-semibold text-sm whitespace-nowrap">{formatRupiah(item.subtotal)}</p>
            </div>
            {onUpdate && (
              <div className="mt-2 flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-lg border bg-background">
                  <button onClick={() => onUpdate(item.id, Math.max(0.5, item.qty - 0.5))} className="p-2 hover:bg-muted"><Minus className="h-3.5 w-3.5" /></button>
                  <span className="text-sm font-semibold w-16 text-center">{item.unit === "kg" ? formatKg(item.qty) : `${item.qty} pcs`}</span>
                  <button onClick={() => onUpdate(item.id, item.qty + 0.5)} className="p-2 hover:bg-muted"><Plus className="h-3.5 w-3.5" /></button>
                </div>
                {onRemove && (
                  <button onClick={() => onRemove(item.id)} className="text-destructive p-2"><Trash2 className="h-4 w-4" /></button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {items.length > 0 && (
        <div className="p-3 border-t bg-muted/30 space-y-1.5">
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{formatRupiah(subtotal)}</span></div>
          {discount > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Diskon</span><span>-{formatRupiah(discount)}</span></div>}
          <div className="flex justify-between font-bold text-base pt-1 border-t"><span>Total</span><span className="text-primary">{formatRupiah(total)}</span></div>
        </div>
      )}
    </div>
  );
}
