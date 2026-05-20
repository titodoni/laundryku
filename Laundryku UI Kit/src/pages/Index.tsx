import { Link } from "react-router-dom";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Button } from "@/components/ui/button";
import {
  Shirt, Smartphone, BarChart3, Wallet, MessageSquare, Check, ArrowRight,
  Clock, Users, Receipt, ShieldCheck,
} from "lucide-react";

const features = [
  { icon: Receipt, title: "POS Cepat", desc: "Buat order dalam 30 detik. Cocok untuk kasir sibuk." },
  { icon: Smartphone, title: "Tanpa Install", desc: "Buka dari HP, tablet, laptop, atau komputer kasir." },
  { icon: MessageSquare, title: "Tracking Pelanggan", desc: "Pelanggan cek status cucian via link, tanpa app." },
  { icon: BarChart3, title: "Dashboard Owner", desc: "Pantau pendapatan, order aktif, dan staf dari mana saja." },
  { icon: Wallet, title: "Finance Sederhana", desc: "Catat pemasukan, pengeluaran, dan laba bersih." },
  { icon: ShieldCheck, title: "Multi Peran", desc: "Owner, admin, kasir, operator, kurir — satu sistem." },
];

const faq = [
  { q: "Apakah perlu install aplikasi?", a: "Tidak. Laundryku 100% berbasis web — buka dari browser apa saja." },
  { q: "Bisa dipakai berapa kasir?", a: "Paket Pro mendukung staff & cabang unlimited. Paket Free hanya 1 staff." },
  { q: "Bagaimana cara pelanggan cek status?", a: "Pelanggan menerima link tracking yang berisi status, estimasi selesai, dan sisa tagihan." },
  { q: "Apakah ada masa coba?", a: "Ya, 7 hari trial penuh fitur Pro. Setelahnya otomatis turun ke Free." },
];

export default function Index() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="container py-12 md:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <Shirt className="h-3.5 w-3.5 text-primary" /> Untuk laundry kiloan Indonesia
            </span>
            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
              POS Laundry Kiloan <span className="text-primary">Berbasis Web</span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              Kelola laundry kiloan dari browser. Kasir, order, tracking, laporan, dan finance dalam satu tempat.
              Tanpa install aplikasi.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="tap-target">
                <Link to="/register">Mulai Gratis 7 Hari <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="tap-target">
                <Link to="/laundry-melati">Lihat Demo</Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="tap-target">
                <Link to="/laundry-melati/login">Masuk — Owner Laundry</Link>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5 text-success" /> Tanpa kartu kredit</span>
              <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5 text-success" /> Setup &lt; 5 menit</span>
              <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5 text-success" /> Bahasa Indonesia</span>
            </div>
          </div>
          {/* POS preview mock */}
          <div className="relative">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <p className="text-sm font-semibold">Order Baru</p>
                  <p className="text-xs text-muted-foreground">Kasir: Siti Aminah</p>
                </div>
                <span className="rounded-full bg-success-soft px-2 py-1 text-xs font-medium text-success">Hari ini</span>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  { name: "Cuci Setrika", qty: "4 kg", price: "Rp40.000" },
                  { name: "Bed Cover", qty: "1 pcs", price: "Rp25.000" },
                  { name: "Express 6 Jam", qty: "2 kg", price: "Rp30.000" },
                ].map(i => (
                  <div key={i.name} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-medium">{i.name}</p>
                      <p className="text-xs text-muted-foreground">{i.qty}</p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">{i.price}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-lg font-bold text-primary">Rp95.000</span>
              </div>
              <Button className="mt-3 w-full tap-target">Buat Order</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="border-y border-border bg-card py-12">
        <div className="container grid gap-6 md:grid-cols-3">
          {[
            { icon: Clock, t: "Lupa pesanan siapa?", d: "Catatan manual sering hilang dan keliru." },
            { icon: Receipt, t: "Tagihan tidak tertagih?", d: "DP & sisa pembayaran sulit dilacak tanpa sistem." },
            { icon: Users, t: "Pelanggan sering tanya?", d: "Kasir terganggu karena harus cek manual setiap saat." },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-warning-soft text-warning">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">{t}</p>
                <p className="text-sm text-muted-foreground">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="fitur" className="container py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">Semua yang dibutuhkan laundry kiloan</h2>
          <p className="mt-2 text-muted-foreground">Cocok untuk laundry kiloan yang ingin lebih rapi tanpa sistem ribet.</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="harga" className="border-t border-border bg-muted/30 py-16">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">Harga sederhana</h2>
            <p className="mt-2 text-muted-foreground">Coba gratis 7 hari, tanpa kartu kredit.</p>
          </div>
          <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-sm font-semibold text-muted-foreground">Free</p>
              <p className="mt-2 text-3xl font-bold">Rp0</p>
              <p className="text-xs text-muted-foreground">7 hari trial penuh, lalu mode terbatas</p>
              <ul className="mt-4 space-y-2 text-sm">
                {["10 order/hari","1 staff","1 cabang","Analytics hari ini saja","Finance hari ini saja"].map(i =>
                  <li key={i} className="flex gap-2"><Check className="h-4 w-4 text-success" /> {i}</li>)}
              </ul>
              <Button asChild variant="outline" className="mt-6 w-full tap-target"><Link to="/register">Mulai Gratis</Link></Button>
            </div>
            <div className="rounded-2xl border-2 border-primary bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-primary">Pro</p>
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">Direkomendasikan</span>
              </div>
              <p className="mt-2 text-3xl font-bold">Rp65.000<span className="text-base font-normal text-muted-foreground">/bulan</span></p>
              <p className="text-xs text-muted-foreground">Untuk laundry yang serius</p>
              <ul className="mt-4 space-y-2 text-sm">
                {["Order unlimited","Staff unlimited","Cabang unlimited","Analytics penuh","Finance penuh + export"].map(i =>
                  <li key={i} className="flex gap-2"><Check className="h-4 w-4 text-success" /> {i}</li>)}
              </ul>
              <Button asChild className="mt-6 w-full tap-target"><Link to="/register">Upgrade ke Pro</Link></Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="container py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Pertanyaan umum</h2>
          <div className="mt-8 space-y-3">
            {faq.map(({ q, a }) => (
              <details key={q} className="group rounded-lg border border-border bg-card p-4">
                <summary className="cursor-pointer list-none text-sm font-medium">{q}</summary>
                <p className="mt-2 text-sm text-muted-foreground">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-primary py-12 text-primary-foreground">
        <div className="container flex flex-col items-center gap-4 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">Siap rapikan laundry Anda?</h2>
          <p className="max-w-xl opacity-90">Mulai gratis 7 hari. Tidak perlu install aplikasi apapun.</p>
          <Button asChild size="lg" variant="secondary" className="tap-target">
            <Link to="/register">Daftar Sekarang <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
