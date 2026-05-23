import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Smartphone, Receipt, Wallet, Users, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { formatRupiah } from "@/lib/format";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary grid place-items-center text-primary-foreground font-bold">L</div>
            <span className="font-display font-bold">Laundryku</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#fitur" className="text-muted-foreground hover:text-foreground">Fitur</a>
            <a href="#harga" className="text-muted-foreground hover:text-foreground">Harga</a>
            <a href="#demo" className="text-muted-foreground hover:text-foreground">Demo</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link to="/melati-clean/login">Masuk</Link></Button>
            <Button asChild size="sm" className="bg-gradient-primary shadow-glow"><Link to="/register">Daftar Gratis</Link></Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-soft" />
        <div className="container relative py-16 lg:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft text-primary px-3 py-1 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" /> Coba gratis 7 hari, tanpa kartu kredit
            </div>
            <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-balance">
              POS Laundry Kiloan <span className="bg-gradient-primary bg-clip-text text-transparent">Berbasis Web</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl">
              Kelola pesanan, struk, pelanggan, dan keuangan laundry Anda dari HP, tablet, atau komputer. Cocok untuk UMKM laundry kiloan di seluruh Indonesia.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gradient-primary shadow-glow font-semibold h-12 px-6">
                <Link to="/register">Mulai Gratis <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6">
                <Link to="/melati-clean">Lihat Demo Live</Link>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5 text-success" /> Tanpa instalasi</span>
              <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5 text-success" /> Multi-cabang</span>
              <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5 text-success" /> Cetak struk thermal</span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-primary opacity-20 blur-3xl rounded-full" />
            <div className="relative rounded-2xl bg-card shadow-elegant border p-3 max-w-sm mx-auto">
              <div className="rounded-xl bg-gradient-primary text-primary-foreground p-4">
                <p className="text-xs opacity-90">Pemasukan Hari Ini</p>
                <p className="text-3xl font-bold font-display">{formatRupiah(2_340_000)}</p>
                <p className="text-xs opacity-90 mt-1">↑ 18% dari kemarin</p>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Pesanan</p>
                  <p className="font-bold font-display">24</p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Berat</p>
                  <p className="font-bold font-display">142 kg</p>
                </div>
              </div>
              <div className="mt-3 rounded-lg border p-3">
                <div className="flex justify-between text-xs">
                  <span className="font-mono text-primary font-bold">MLT-260521-007</span>
                  <span className="text-success font-semibold">Lunas</span>
                </div>
                <p className="text-sm font-semibold mt-1">Pak Agus · 7.5 kg</p>
                <p className="text-xs text-muted-foreground">Cuci Kering Setrika</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fitur */}
      <section id="fitur" className="container py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold font-display">Semua yang dibutuhkan laundry kiloan modern</h2>
          <p className="mt-3 text-muted-foreground">Dari mencatat pesanan, mencetak struk thermal, hingga laporan keuangan harian.</p>
        </div>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { i: Smartphone, t: "Kasir Mobile-First", d: "Antarmuka cepat untuk kasir di HP atau tablet." },
            { i: Receipt, t: "Struk & Label Otomatis", d: "Cetak struk thermal dan label kemasan dengan QR tracking." },
            { i: Users, t: "Database Pelanggan", d: "Cari pelanggan dengan nomor HP, lihat riwayat dan total transaksi." },
            { i: Wallet, t: "Laporan Keuangan", d: "Pantau pemasukan, pengeluaran, dan laba bersih per cabang." },
            { i: ShieldCheck, t: "Multi Role", d: "Owner, Kasir, Operator, dan Kurir dengan hak akses berbeda." },
            { i: Zap, t: "Tracking Publik", d: "Pelanggan bisa cek status cucian via tautan publik." },
          ].map(f => (
            <div key={f.t} className="rounded-2xl border bg-card p-5 hover:shadow-elegant transition">
              <div className="h-10 w-10 rounded-xl bg-primary-soft text-primary grid place-items-center"><f.i className="h-5 w-5" /></div>
              <h3 className="mt-3 font-semibold font-display">{f.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Harga */}
      <section id="harga" className="container py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold font-display">Harga sederhana, tanpa kontrak</h2>
          <p className="mt-3 text-muted-foreground">Mulai gratis. Upgrade kapan saja sesuai kebutuhan bisnis Anda.</p>
        </div>
        <div className="mt-10 grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          <div className="rounded-2xl border bg-card p-6">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Free</p>
            <p className="mt-2 text-3xl font-bold font-display">Rp0<span className="text-sm font-normal text-muted-foreground">/bulan</span></p>
            <p className="mt-1 text-sm text-muted-foreground">Untuk laundry baru yang ingin mulai mencatat digital.</p>
            <ul className="mt-5 space-y-2 text-sm">
              <li className="flex gap-2"><Check className="h-4 w-4 text-success shrink-0 mt-0.5" /> 10 pesanan per hari</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-success shrink-0 mt-0.5" /> 1 staff</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-success shrink-0 mt-0.5" /> Analitik & keuangan hari ini saja</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-success shrink-0 mt-0.5" /> Struk & label dasar</li>
            </ul>
            <Button asChild variant="outline" className="mt-6 w-full"><Link to="/register">Mulai Gratis</Link></Button>
          </div>
          <div className="rounded-2xl border-2 border-primary bg-gradient-soft p-6 shadow-glow relative">
            <span className="absolute -top-3 right-4 rounded-full bg-gradient-primary text-primary-foreground text-xs font-semibold px-3 py-1">Populer</span>
            <p className="text-xs font-semibold uppercase text-primary">Pro</p>
            <p className="mt-2 text-3xl font-bold font-display">{formatRupiah(149_000)}<span className="text-sm font-normal text-muted-foreground">/bulan</span></p>
            <p className="mt-1 text-sm text-muted-foreground">Untuk bisnis laundry yang ingin tumbuh tanpa batas.</p>
            <ul className="mt-5 space-y-2 text-sm">
              <li className="flex gap-2"><Check className="h-4 w-4 text-success shrink-0 mt-0.5" /> Pesanan & staff tak terbatas</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-success shrink-0 mt-0.5" /> Multi cabang</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-success shrink-0 mt-0.5" /> Laporan & ekspor data</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-success shrink-0 mt-0.5" /> Tracking publik bermerek</li>
            </ul>
            <Button asChild className="mt-6 w-full bg-gradient-primary shadow-glow"><Link to="/register">Coba Pro 7 Hari</Link></Button>
          </div>
        </div>
      </section>

      <footer id="demo" className="border-t bg-muted/30">
        <div className="container py-10 text-sm text-muted-foreground flex flex-col sm:flex-row justify-between gap-4">
          <p>© 2026 Laundryku — POS laundry kiloan berbasis web.</p>
          <div className="flex gap-4">
            <Link to="/melati-clean" className="hover:text-foreground">Demo Melati Clean</Link>
            <Link to="/register" className="hover:text-foreground">Daftar</Link>
            <Link to="/melati-clean/login" className="hover:text-foreground">Masuk</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
