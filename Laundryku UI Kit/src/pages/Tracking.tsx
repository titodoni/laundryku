import { useParams, useSearchParams } from "react-router-dom";
import { orderByCode, organizations, customerById } from "@/lib/mock-data";
import { TenantPublicLayout } from "@/components/layouts/TenantPublicLayout";
import { orderStatusFlow, orderStatusLabel, formatIDR, formatDateID, paymentStatusLabel } from "@/lib/status-labels";
import { Check, MessageCircle, Shirt } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ErrorState } from "@/components/shared/ErrorState";

export default function Tracking() {
  const { slug, orderCode } = useParams();
  const [params, setParams] = useSearchParams();
  const [phone, setPhone] = useState(params.get("phone") ?? "");
  const org = organizations.find(o => o.slug === slug) ?? organizations[0];
  const order = orderByCode(orderCode!);

  if (!params.get("phone")) {
    return (
      <TenantPublicLayout>
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-6">
          <h1 className="text-lg font-bold">Lacak Pesanan</h1>
          <p className="mt-1 text-sm text-muted-foreground">Masukkan nomor HP untuk verifikasi.</p>
          <div className="mt-4 space-y-2">
            <Input placeholder="0812-..." value={phone} onChange={e => setPhone(e.target.value)} inputMode="tel" />
            <Button className="w-full tap-target" onClick={() => setParams({ phone })}>Lacak</Button>
          </div>
        </div>
      </TenantPublicLayout>
    );
  }

  if (!order) {
    return (
      <TenantPublicLayout>
        <div className="mx-auto max-w-md">
          <ErrorState title="Order tidak ditemukan." description="Periksa kembali nomor pesanan dan nomor HP Anda." />
        </div>
      </TenantPublicLayout>
    );
  }

  const c = customerById(order.customerId);
  const currentIdx = orderStatusFlow.indexOf(order.status);

  return (
    <TenantPublicLayout>
      <div className="mx-auto max-w-md space-y-4">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Shirt className="h-5 w-5" /></div>
          <div>
            <p className="font-semibold">{org.name}</p>
            <p className="text-xs text-muted-foreground">No. {order.orderNumber}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground">Status saat ini</p>
          <p className="text-xl font-bold text-primary">{orderStatusLabel[order.status]}</p>
          <p className="mt-1 text-xs text-muted-foreground">Estimasi selesai: {formatDateID(order.estimatedReadyAt)}</p>

          <ol className="mt-5 space-y-3">
            {orderStatusFlow.map((s, i) => {
              const done = i <= currentIdx;
              return (
                <li key={s} className="flex items-center gap-3">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full ${done ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}`}>
                    {done ? <Check className="h-4 w-4" /> : <span className="text-xs">{i+1}</span>}
                  </div>
                  <span className={`text-sm ${done ? "font-medium text-foreground" : "text-muted-foreground"}`}>{orderStatusLabel[s]}</span>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-semibold">Item</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {order.items.map((i, idx) => (
              <li key={idx} className="flex justify-between">
                <span>{i.name} ({i.qty} {i.unit})</span>
                <span className="tabular-nums">{formatIDR(i.subtotal)}</span>
              </li>
            ))}
          </ul>
          <hr className="my-3 border-border" />
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-semibold tabular-nums">{formatIDR(order.total)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Status Bayar</span><span className="font-medium">{paymentStatusLabel[order.paymentStatus]}</span></div>
            {order.remaining > 0 && (
              <div className="flex justify-between text-warning"><span>Sisa pembayaran</span><span className="font-semibold tabular-nums">{formatIDR(order.remaining)}</span></div>
            )}
          </div>
        </div>

        <a href={`https://wa.me/${org.phone.replace(/\D/g,"")}?text=${encodeURIComponent(`Halo, saya mau tanya pesanan ${order.orderCode}`)}`}
           className="flex w-full items-center justify-center gap-2 rounded-md bg-success px-4 py-3 text-sm font-medium text-success-foreground tap-target">
          <MessageCircle className="h-4 w-4" /> Chat via WhatsApp
        </a>
        <p className="text-center text-xs text-muted-foreground">Pelanggan: {c?.name}</p>
      </div>
    </TenantPublicLayout>
  );
}