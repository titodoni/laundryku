import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Phone, Clock, Search, Star } from "lucide-react";
import { useState } from "react";
import { org, branches } from "@/mocks/data";

const TenantPublic = () => {
  const [code, setCode] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-hero text-primary-foreground">
        <div className="container py-10">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-white/15 backdrop-blur grid place-items-center text-2xl font-bold font-display">M</div>
            <div>
              <h1 className="text-2xl font-bold font-display">{org.name}</h1>
              <p className="text-sm opacity-90 inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-current" /> 4.9 · 240+ ulasan</p>
            </div>
          </div>
          <p className="mt-4 max-w-lg opacity-95">Laundry kiloan terpercaya di Bandung. Cuci bersih, wangi tahan lama, selesai tepat waktu.</p>
          <div className="mt-6 flex gap-2">
            <Button asChild size="lg" variant="secondary" className="font-semibold"><Link to="/melati-clean/login">Masuk Kasir</Link></Button>
            <Button asChild size="lg" variant="outline" className="font-semibold bg-white/10 border-white/30 text-primary-foreground hover:bg-white/20"><a href="tel:0812-3456-7890"><Phone className="h-4 w-4 mr-1.5" /> Hubungi Kami</a></Button>
          </div>
        </div>
      </header>

      <section className="container py-8">
        <div className="rounded-2xl border bg-card p-5 shadow-soft">
          <h2 className="font-bold font-display">Lacak Pesanan Anda</h2>
          <p className="text-sm text-muted-foreground mt-1">Masukkan nomor pesanan untuk melihat status terbaru.</p>
          <form className="mt-3 flex gap-2"
            onSubmit={(e) => { e.preventDefault(); if (code) window.location.href = `/melati-clean/orders/${code}/track`; }}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={code} onChange={e => setCode(e.target.value)} placeholder="MLT-260519-001" className="pl-9 h-11 font-mono" />
            </div>
            <Button type="submit" className="h-11 bg-gradient-primary shadow-glow font-semibold">Lacak</Button>
          </form>
          <button onClick={() => window.location.href = "/melati-clean/orders/MLT-260519-001/track"} className="mt-2 text-xs text-primary font-medium">Contoh: MLT-260519-001</button>
        </div>
      </section>

      <section className="container py-6">
        <h2 className="font-bold font-display text-lg mb-3">Cabang Kami</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {branches.map(b => (
            <div key={b.id} className="rounded-xl border bg-card p-4">
              <p className="font-semibold">{b.name}</p>
              <p className="text-sm text-muted-foreground inline-flex items-start gap-1.5 mt-1.5"><MapPin className="h-4 w-4 shrink-0 mt-0.5" /> {b.address}</p>
              <p className="text-sm text-muted-foreground inline-flex items-center gap-1.5 mt-1"><Phone className="h-4 w-4" /> {b.phone}</p>
              <p className="text-sm text-muted-foreground inline-flex items-center gap-1.5 mt-1"><Clock className="h-4 w-4" /> Buka 07.00 - 21.00</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t mt-8">
        <div className="container py-6 text-xs text-muted-foreground flex justify-between">
          <span>© 2026 {org.name}</span>
          <span>Powered by <Link to="/" className="text-primary font-semibold">Laundryku</Link></span>
        </div>
      </footer>
    </div>
  );
};

export default TenantPublic;
