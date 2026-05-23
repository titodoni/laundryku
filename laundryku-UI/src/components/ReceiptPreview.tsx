import { formatRupiah, formatTanggal, formatJam } from "@/lib/format";
import { StatusBadge } from "./StatusBadge";
import { paymentChannelLabel } from "@/lib/labels";
import type { Order } from "@/mocks/types";
import { Scissors } from "lucide-react";
import { org, branches } from "@/mocks/data";

export function ReceiptPreview({ order }: { order: Order }) {
  const branch = branches.find(b => b.id === order.branchId) ?? branches[0];
  const change = order.paid - order.total;
  return (
    <div className="mx-auto max-w-sm bg-white text-foreground font-mono text-[12px] shadow-elegant rounded-xl overflow-hidden border print:shadow-none print:border-0">
      <div className="p-4 text-center border-b border-dashed">
        <p className="font-display font-bold text-base text-primary">{org.name}</p>
        <p className="text-[11px]">{branch.address}</p>
        <p className="text-[11px]">{branch.phone}</p>
      </div>
      <div className="p-4 space-y-1 border-b border-dashed">
        <div className="flex justify-between"><span>No</span><span className="font-bold">{order.code}</span></div>
        <div className="flex justify-between"><span>Tanggal</span><span>{formatTanggal(order.createdAt)} {formatJam(order.createdAt)}</span></div>
        <div className="flex justify-between"><span>Pelanggan</span><span>{order.customerName}</span></div>
        <div className="flex justify-between"><span>Kasir</span><span>{order.cashierName}</span></div>
      </div>
      <div className="p-4 border-b border-dashed space-y-2">
        {order.items.map(it => (
          <div key={it.id}>
            <p className="font-semibold">{it.serviceName}</p>
            <div className="flex justify-between">
              <span>{it.qty} {it.unit} × {formatRupiah(it.pricePerUnit)}</span>
              <span>{formatRupiah(it.subtotal)}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 space-y-1 border-b border-dashed">
        <div className="flex justify-between"><span>Subtotal</span><span>{formatRupiah(order.subtotal)}</span></div>
        {order.discount > 0 && <div className="flex justify-between"><span>Diskon</span><span>-{formatRupiah(order.discount)}</span></div>}
        <div className="flex justify-between font-bold text-[14px]"><span>TOTAL</span><span>{formatRupiah(order.total)}</span></div>
        <div className="flex justify-between"><span>Dibayar</span><span>{formatRupiah(order.paid)}</span></div>
        {change > 0 && <div className="flex justify-between"><span>Kembali</span><span>{formatRupiah(change)}</span></div>}
        {order.payments[0] && <div className="flex justify-between"><span>Metode</span><span>{paymentChannelLabel[order.payments[0].channel]}</span></div>}
      </div>
      <div className="p-4 text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <StatusBadge kind="order" status={order.status} />
          <StatusBadge kind="payment" status={order.paymentStatus} />
        </div>
        <p className="text-[11px]">Estimasi selesai {formatTanggal(order.estimatedReadyAt)} {formatJam(order.estimatedReadyAt)}</p>
        <div className="pt-2 border-t border-dashed">
          <p className="text-[11px]">Lacak pesanan:</p>
          <p className="text-[11px] font-semibold">laundryku.id/melati-clean/orders/{order.code}/track</p>
        </div>
        <p className="text-[10px] text-muted-foreground pt-2">Terima kasih telah menggunakan layanan kami</p>
        <div className="flex items-center justify-center gap-1 text-muted-foreground pt-1">
          <Scissors className="h-3 w-3" />
          <span className="border-t border-dashed border-current flex-1 max-w-[120px]" />
        </div>
      </div>
    </div>
  );
}
