import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Store, MapPin, Sparkles, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/format";

const steps = [
  { icon: Store, title: "Profil Usaha" },
  { icon: MapPin, title: "Cabang Pertama" },
  { icon: Sparkles, title: "Layanan" },
  { icon: CreditCard, title: "Metode Bayar" },
];

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const nav = useNavigate();
  const isLast = step === steps.length - 1;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary grid place-items-center text-primary-foreground font-bold">L</div>
            <span className="font-display font-bold">Laundryku</span>
          </Link>
          <span className="text-xs text-muted-foreground">Langkah {step + 1} dari {steps.length}</span>
        </div>
      </header>

      <div className="container py-6 max-w-2xl">
        {/* stepper */}
        <ol className="flex items-center gap-2 mb-6">
          {steps.map((s, i) => (
            <li key={i} className="flex-1 flex flex-col items-center">
              <div className={cn("h-9 w-9 rounded-full grid place-items-center border-2 transition",
                i < step ? "bg-primary border-primary text-primary-foreground" :
                i === step ? "border-primary text-primary bg-primary-soft" : "border-border text-muted-foreground bg-card"
              )}>
                {i < step ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
              </div>
              <span className={cn("mt-1.5 text-[10px] font-medium text-center", i === step ? "text-primary" : "text-muted-foreground")}>{s.title}</span>
            </li>
          ))}
        </ol>

        <div className="rounded-2xl border bg-card p-5 shadow-soft">
          {step === 0 && (
            <div className="space-y-3">
              <h2 className="font-bold font-display text-xl">Profil Usaha</h2>
              <p className="text-sm text-muted-foreground">Beri tahu kami tentang laundry Anda.</p>
              <div><Label>Nama Usaha</Label><Input className="h-11 mt-1.5" defaultValue="Melati Clean Laundry" /></div>
              <div><Label>Slug URL Publik</Label>
                <div className="mt-1.5 flex items-center rounded-md border bg-background overflow-hidden">
                  <span className="px-3 text-xs text-muted-foreground">laundryku.id/</span>
                  <Input className="h-11 border-0 focus-visible:ring-0" defaultValue="melati-clean" />
                </div>
              </div>
              <div><Label>Jenis Bisnis</Label><Input className="h-11 mt-1.5" defaultValue="Laundry Kiloan" /></div>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-3">
              <h2 className="font-bold font-display text-xl">Cabang Pertama</h2>
              <p className="text-sm text-muted-foreground">Tambahkan lokasi cabang utama Anda.</p>
              <div><Label>Nama Cabang</Label><Input className="h-11 mt-1.5" defaultValue="Cabang Pusat" /></div>
              <div><Label>Alamat</Label><Input className="h-11 mt-1.5" defaultValue="Jl. Melati No. 12, Bandung" /></div>
              <div><Label>Nomor Telepon</Label><Input className="h-11 mt-1.5" defaultValue="0812-3456-7890" /></div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-3">
              <h2 className="font-bold font-display text-xl">Daftar Layanan</h2>
              <p className="text-sm text-muted-foreground">Pilih layanan yang Anda tawarkan. Bisa diubah nanti.</p>
              {[
                { n: "Cuci Kering Lipat", p: 7000 },
                { n: "Cuci Kering Setrika", p: 10000 },
                { n: "Setrika Saja", p: 6000 },
                { n: "Express 6 Jam", p: 15000 },
              ].map((s, i) => (
                <label key={i} className="flex items-center justify-between rounded-xl border p-3 cursor-pointer hover:border-primary">
                  <div>
                    <p className="font-medium text-sm">{s.n}</p>
                    <p className="text-xs text-muted-foreground">{formatRupiah(s.p)}/kg</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 accent-primary" />
                </label>
              ))}
            </div>
          )}
          {step === 3 && (
            <div className="space-y-3">
              <h2 className="font-bold font-display text-xl">Metode Pembayaran</h2>
              <p className="text-sm text-muted-foreground">Aktifkan metode yang Anda terima.</p>
              {["Tunai", "Transfer Bank", "QRIS"].map(m => (
                <label key={m} className="flex items-center justify-between rounded-xl border p-3 cursor-pointer hover:border-primary">
                  <p className="font-medium text-sm">{m}</p>
                  <input type="checkbox" defaultChecked className="h-4 w-4 accent-primary" />
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          {step > 0 && <Button variant="outline" className="flex-1 h-11" onClick={() => setStep(s => s - 1)}>Kembali</Button>}
          <Button className="flex-1 h-11 bg-gradient-primary shadow-glow font-semibold"
            onClick={() => isLast ? nav("/melati-clean/dashboard") : setStep(s => s + 1)}>
            {isLast ? "Selesai & Masuk Dashboard" : "Lanjut"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
