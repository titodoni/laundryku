import { useState } from "react";
import { POSLayout } from "@/components/layouts/POSLayout";
import { services, customers, paymentMethods } from "@/lib/mock-data";
import { categoryLabel, formatIDR, paymentTypeLabel } from "@/lib/status-labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Minus, Search, User, Check, Printer, Tag, ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

type CartItem = { id: string; name: string; qty: number; price: number; unit: string };

export default function POS() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [step, setStep] = useState<1|2|3|4>(1);
  const [done, setDone] = useState(false);
  const [customer, setCustomer] = useState<typeof customers[number] | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [payType, setPayType] = useState<"FULL"|"DP"|"NONE">("FULL");
  const [payMethod, setPayMethod] = useState(paymentMethods[0].id);
  const [paid, setPaid] = useState(0);

  const total = cart.reduce((s,i) => s + i.qty * i.price, 0);
  const effectivePaid = payType === "FULL" ? total : payType === "NONE" ? 0 : paid;
  const remaining = total - effectivePaid;
  const change = Math.max(0, effectivePaid - total);

  const addItem = (s: typeof services[number]) => {
    setCart(prev => {
      const found = prev.find(i => i.id === s.id);
      if (found) return prev.map(i => i.id === s.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { id: s.id, name: s.name, qty: s.minQty, price: s.price, unit: s.unit }];
    });
  };
  const setQty = (id: string, d: number) =>
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + d) } : i));
  const remove = (id: string) => setCart(prev => prev.filter(i => i.id !== id));

  if (done) return <POSSuccess slug={slug!} reset={() => { setDone(false); setStep(1); setCart([]); setCustomer(null); }} />;

  return (
    <POSLayout>
      <div className="container max-w-3xl space-y-3 py-3">
        {/* Step indicator */}
        <div className="flex items-center justify-between text-xs">
          {["Pelanggan","Layanan","Bayar","Konfirmasi"].map((l, i) => (
            <div key={l} className={`flex flex-1 flex-col items-center ${i+1 <= step ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${i+1 === step ? "bg-primary text-primary-foreground" : i+1 < step ? "bg-success text-success-foreground" : "bg-muted"}`}>{i+1}</div>
              <span className="mt-1">{l}</span>
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-3 rounded-xl border border-border bg-card p-4">
            <h2 className="font-semibold">Pilih Pelanggan</h2>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cari nama atau nomor HP" className="pl-9 tap-target" />
            </div>
            <Button variant="outline" className="w-full tap-target" onClick={() => { setCustomer(customers[3]); setStep(2); }}>
              <User className="mr-2 h-4 w-4" /> Pelanggan Umum
            </Button>
            <div className="space-y-2">
              {customers.slice(0,3).map(c => (
                <button key={c.id} onClick={() => { setCustomer(c); setStep(2); }}
                  className="tap-target flex w-full items-center justify-between rounded-lg border border-border p-3 text-left hover:border-primary">
                  <div><p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.phone}</p></div>
                  <span className="text-xs text-muted-foreground">{c.totalOrders} order</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-card p-3">
              <p className="text-xs text-muted-foreground">Pelanggan</p>
              <p className="font-medium">{customer?.name}</p>
            </div>

            {(["KILOAN","SATUAN","EXPRESS","ADDON"] as const).map(cat => {
              const items = services.filter(s => s.category === cat);
              if (items.length === 0) return null;
              return (
                <div key={cat} className="rounded-xl border border-border bg-card p-4">
                  <h3 className="text-sm font-semibold">{categoryLabel[cat]}</h3>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {items.map(s => (
                      <button key={s.id} onClick={() => addItem(s)}
                        className="tap-target flex flex-col rounded-lg border border-border p-3 text-left hover:border-primary hover:bg-primary-soft">
                        <span className="text-sm font-medium leading-tight">{s.name}</span>
                        <span className="mt-1 text-xs text-muted-foreground">{formatIDR(s.price)}/{s.unit}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {cart.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-semibold">Keranjang</h3>
                <div className="mt-2 space-y-2">
                  {cart.map(i => (
                    <div key={i.id} className="flex items-center gap-2 rounded-lg border border-border p-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{i.name}</p>
                        <p className="text-xs text-muted-foreground">{formatIDR(i.price)}/{i.unit}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="outline" className="h-9 w-9" onClick={() => setQty(i.id, -1)}><Minus className="h-3 w-3" /></Button>
                        <span className="w-10 text-center text-sm font-semibold tabular-nums">{i.qty}</span>
                        <Button size="icon" variant="outline" className="h-9 w-9" onClick={() => setQty(i.id, +1)}><Plus className="h-3 w-3" /></Button>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => remove(i.id)}>Hapus</Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sticky total */}
            <div className="sticky bottom-20 z-10 flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-lg font-bold text-primary tabular-nums">{formatIDR(total)}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" className="tap-target" onClick={() => setStep(1)}><ArrowLeft className="mr-1 h-4 w-4" />Kembali</Button>
                <Button className="tap-target" disabled={cart.length === 0} onClick={() => setStep(3)}>Lanjut Bayar</Button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3 rounded-xl border border-border bg-card p-4">
            <h2 className="font-semibold">Pembayaran</h2>
            <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-xl font-bold tabular-nums">{formatIDR(total)}</span>
            </div>

            <div>
              <Label className="text-xs">Jenis Pembayaran</Label>
              <div className="mt-1 grid grid-cols-3 gap-2">
                {([["FULL","Lunas"],["DP","DP"],["NONE","Belum Bayar"]] as const).map(([v, l]) => (
                  <button key={v} onClick={() => setPayType(v)}
                    className={`tap-target rounded-lg border p-2 text-sm ${payType===v ? "border-primary bg-primary-soft text-primary font-semibold" : "border-border"}`}>{l}</button>
                ))}
              </div>
            </div>

            {payType !== "NONE" && (
              <div>
                <Label className="text-xs">Metode</Label>
                <div className="mt-1 grid grid-cols-3 gap-2">
                  {paymentMethods.map(m => (
                    <button key={m.id} onClick={() => setPayMethod(m.id)}
                      className={`tap-target rounded-lg border p-2 text-sm ${payMethod===m.id ? "border-primary bg-primary-soft text-primary font-semibold" : "border-border"}`}>
                      {paymentTypeLabel[m.type]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {payType === "DP" && (
              <div className="space-y-1.5">
                <Label className="text-xs">Jumlah Bayar</Label>
                <Input type="number" inputMode="numeric" value={paid || ""} onChange={e => setPaid(+e.target.value)} className="tap-target" />
              </div>
            )}

            <div className="rounded-lg bg-muted/40 p-3 text-sm">
              <Row label="Dibayar" value={formatIDR(effectivePaid)} />
              <Row label="Sisa" value={formatIDR(Math.max(0, remaining))} tone={remaining > 0 ? "warning" : undefined} />
              <Row label="Kembalian" value={formatIDR(change)} tone={change > 0 ? "success" : undefined} />
            </div>

            <div className="flex gap-2">
              <Button variant="ghost" className="tap-target" onClick={() => setStep(2)}><ArrowLeft className="mr-1 h-4 w-4" />Kembali</Button>
              <Button className="flex-1 tap-target" onClick={() => setStep(4)}>Lanjut Konfirmasi</Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3 rounded-xl border border-border bg-card p-4">
            <h2 className="font-semibold">Konfirmasi Order</h2>
            <div className="space-y-1 text-sm">
              <p><span className="text-muted-foreground">Pelanggan:</span> {customer?.name}</p>
              <p><span className="text-muted-foreground">Item:</span> {cart.length} layanan</p>
              <p><span className="text-muted-foreground">Total:</span> <span className="font-semibold">{formatIDR(total)}</span></p>
              <p><span className="text-muted-foreground">Bayar:</span> {formatIDR(effectivePaid)}</p>
            </div>
            <Button className="w-full tap-target" size="lg" onClick={() => setDone(true)}>Buat Order</Button>
            <Button variant="ghost" className="w-full" onClick={() => setStep(3)}>Kembali</Button>
          </div>
        )}
      </div>
    </POSLayout>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "success"|"warning" }) {
  const cls = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "";
  return <div className="flex justify-between py-0.5"><span className="text-muted-foreground">{label}</span><span className={`font-semibold tabular-nums ${cls}`}>{value}</span></div>;
}

function POSSuccess({ slug, reset }: { slug: string; reset: () => void }) {
  const orderNumber = "MLT-260520-010";
  return (
    <POSLayout>
      <div className="container max-w-md py-6">
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-success">
            <Check className="h-7 w-7" />
          </div>
          <h2 className="mt-3 text-xl font-bold">Order Berhasil Dibuat</h2>
          <p className="text-sm text-muted-foreground">No. {orderNumber}</p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button asChild variant="outline" className="tap-target"><a href={`/${slug}/pos/receipt/${orderNumber}`}><Printer className="mr-1 h-4 w-4" />Struk</a></Button>
            <Button asChild variant="outline" className="tap-target"><a href={`/${slug}/pos/label/${orderNumber}`}><Tag className="mr-1 h-4 w-4" />Label</a></Button>
          </div>
          <Button className="mt-3 w-full tap-target" onClick={reset}>Buat Order Baru</Button>
        </div>
      </div>
    </POSLayout>
  );
}