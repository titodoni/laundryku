import { useState, useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { CustomerSearch } from "@/components/CustomerSearch";
import { ServiceGrid } from "@/components/ServiceCard";
import { OrderSummary } from "@/components/OrderSummary";
import { PaymentStep } from "@/components/PaymentStep";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { customers, services } from "@/mocks/data";
import type { Customer, OrderItem, Service } from "@/mocks/types";
import { ChevronLeft, ChevronRight, User, Sparkles, CreditCard, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { formatRupiah } from "@/lib/format";

const stepsMeta = [
  { icon: User, label: "Pelanggan" },
  { icon: Sparkles, label: "Layanan" },
  { icon: CreditCard, label: "Bayar" },
];

const POS = () => {
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [customer, setCustomer] = useState<Customer>();
  const [items, setItems] = useState<OrderItem[]>([]);
  const [activeService, setActiveService] = useState<Service | undefined>();
  const [qty, setQty] = useState<string>("1");

  const total = useMemo(() => items.reduce((s, i) => s + i.subtotal, 0), [items]);
  const canNext = step === 0 ? !!customer : step === 1 ? items.length > 0 : true;

  function addItem() {
    if (!activeService) return;
    const q = Math.max(0.1, Number(qty) || 0);
    const ppk = activeService.price.pricePerKg ?? activeService.price.pricePerItem ?? 0;
    const unit: "kg" | "pcs" = activeService.price.pricePerKg ? "kg" : "pcs";
    setItems(prev => [...prev, {
      id: `it_${Date.now()}`, serviceId: activeService.id, serviceName: activeService.name,
      serviceType: activeService.type, qty: q, unit, pricePerUnit: ppk, subtotal: Math.round(q * ppk),
    }]);
    setActiveService(undefined); setQty("1");
  }

  function updateItem(id: string, q: number) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty: q, subtotal: Math.round(q * i.pricePerUnit) } : i));
  }
  function removeItem(id: string) { setItems(prev => prev.filter(i => i.id !== id)); }

  return (
    <AppShell title="Buat Pesanan" subtitle={`Langkah ${step + 1} dari 3`} back={step === 0 ? undefined : "back"}>
      <div className="container py-4 max-w-2xl space-y-4">
        {/* stepper */}
        <ol className="flex items-center gap-1">
          {stepsMeta.map((s, i) => (
            <li key={i} className="flex-1 flex items-center gap-2">
              <div className={cn("h-8 w-8 rounded-full grid place-items-center border-2 shrink-0",
                i < step ? "bg-primary border-primary text-primary-foreground" :
                i === step ? "border-primary text-primary bg-primary-soft" : "border-border text-muted-foreground bg-card")}>
                {i < step ? <CheckCircle2 className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
              </div>
              {i < stepsMeta.length - 1 && <div className={cn("flex-1 h-0.5", i < step ? "bg-primary" : "bg-border")} />}
            </li>
          ))}
        </ol>

        {step === 0 && (
          <div className="space-y-3">
            <div>
              <p className="font-semibold font-display mb-2">Pilih Pelanggan</p>
              <CustomerSearch customers={customers} value={customer} onChange={setCustomer} />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <p className="font-semibold font-display">Pilih Layanan</p>
            <ServiceGrid services={services} selectedId={activeService?.id} onSelect={setActiveService} />
            {activeService && (
              <div className="rounded-xl border bg-card p-3 space-y-2">
                <p className="text-sm font-semibold">{activeService.name}</p>
                <div className="flex gap-2 items-center">
                  <Input type="number" step="0.1" value={qty} onChange={e => setQty(e.target.value)} className="h-11 flex-1" />
                  <span className="text-sm font-semibold text-muted-foreground">{activeService.price.pricePerKg ? "kg" : "pcs"}</span>
                  <Button onClick={addItem} className="h-11 bg-gradient-primary">Tambah</Button>
                </div>
              </div>
            )}
            <OrderSummary items={items} onUpdate={updateItem} onRemove={removeItem} />
          </div>
        )}

        {step === 2 && (
          <PaymentStep total={total} onConfirm={() => nav("/melati-clean/pos/receipt/MLT-260519-001")} />
        )}

        {step < 2 && (
          <div className="flex gap-2 sticky bottom-20 lg:bottom-4 pt-2">
            {step > 0 && <Button variant="outline" className="h-12" onClick={() => setStep(s => s - 1)}><ChevronLeft className="h-4 w-4" /></Button>}
            <Button disabled={!canNext} onClick={() => setStep(s => s + 1)}
              className="flex-1 h-12 bg-gradient-primary shadow-glow font-semibold">
              {step === 1 ? `Bayar ${formatRupiah(total)}` : "Lanjut"} <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default POS;
