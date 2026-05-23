import { useState } from "react";
import { Banknote, CreditCard, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/format";
import type { PaymentChannel } from "@/mocks/types";

const options: { value: PaymentChannel; label: string; icon: any }[] = [
  { value: "CASH", label: "Tunai", icon: Banknote },
  { value: "TRANSFER", label: "Transfer", icon: CreditCard },
  { value: "QRIS", label: "QRIS", icon: QrCode },
];

export function PaymentStep({ total, onConfirm }: { total: number; onConfirm: (channel: PaymentChannel, paid: number) => void }) {
  const [channel, setChannel] = useState<PaymentChannel>("CASH");
  const [paid, setPaid] = useState<number>(total);
  const change = paid - total;
  const status = paid >= total ? "Lunas" : paid > 0 ? "DP" : "Belum Bayar";

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-gradient-primary text-primary-foreground p-4 shadow-glow">
        <p className="text-xs opacity-90">Total Tagihan</p>
        <p className="text-3xl font-bold font-display">{formatRupiah(total)}</p>
      </div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-1.5">Metode Pembayaran</p>
        <div className="grid grid-cols-3 gap-2">
          {options.map(o => (
            <button key={o.value} onClick={() => setChannel(o.value)}
              className={cn("rounded-xl border-2 p-3 flex flex-col items-center gap-1.5 transition",
                channel === o.value ? "border-primary bg-primary-soft" : "border-border")}>
              <o.icon className={cn("h-5 w-5", channel === o.value ? "text-primary" : "text-muted-foreground")} />
              <span className="text-xs font-semibold">{o.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-1.5">Jumlah Dibayar</p>
        <Input type="number" value={paid} onChange={e => setPaid(Number(e.target.value))} className="h-12 text-lg font-bold" />
        <div className="grid grid-cols-4 gap-1.5 mt-2">
          {[total, 50_000, 100_000, 200_000].map((v, i) => (
            <button key={i} onClick={() => setPaid(v)} className="text-xs rounded-lg border bg-card py-1.5 font-medium hover:border-primary">
              {i === 0 ? "Pas" : formatRupiah(v)}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-xl border bg-card p-3 flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{change >= 0 ? "Kembalian" : "Kurang"}</span>
        <span className="font-bold">{formatRupiah(Math.abs(change))} · <span className="text-primary">{status}</span></span>
      </div>
      <Button onClick={() => onConfirm(channel, paid)} className="w-full h-12 text-base font-semibold bg-gradient-primary shadow-glow">
        Konfirmasi & Cetak Struk
      </Button>
    </div>
  );
}
