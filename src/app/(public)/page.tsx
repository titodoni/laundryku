import Link from "next/link";
import { ArrowRight, BarChart3, Check, MessageSquare, Receipt, Shirt, Smartphone, Wallet } from "lucide-react";

const features = [
  { icon: Receipt, title: "POS Cepat", desc: "Buat order dan pembayaran dari browser." },
  { icon: Smartphone, title: "Tanpa Install", desc: "Dipakai dari HP, tablet, laptop, atau komputer kasir." },
  { icon: MessageSquare, title: "Tracking Pelanggan", desc: "Pelanggan cek status cucian lewat link." },
  { icon: BarChart3, title: "Dashboard Owner", desc: "Pantau order, staf, dan performa bisnis." },
  { icon: Wallet, title: "Finance Sederhana", desc: "Catat pemasukan, pengeluaran, dan laba bersih." }
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Shirt className="h-5 w-5" />
            </span>
            Laundryku
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/register" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              Daftar Gratis
            </Link>
          </div>
        </div>
      </header>

      <section className="container grid gap-10 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Shirt className="h-3.5 w-3.5 text-primary" /> Untuk laundry kiloan Indonesia
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            POS Laundry Kiloan <span className="text-primary">Berbasis Web</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Kelola kasir, order, tracking, laporan, finance, dan billing dari satu sistem.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/register" className="tap-target inline-flex items-center rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
              Mulai Gratis 7 Hari <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-4 text-xs text-muted-foreground">
            {["Tanpa kartu kredit", "Setup cepat", "Bahasa Indonesia"].map((item) => (
              <span key={item} className="inline-flex items-center gap-1">
                <Check className="h-3.5 w-3.5 text-success" /> {item}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="border-b pb-3">
            <p className="font-semibold">Order Baru</p>
            <p className="text-xs text-muted-foreground">Kasir: Siti Aminah</p>
          </div>
          <div className="mt-4 space-y-3">
            {[
              ["Cuci Setrika", "4 kg", "Rp40.000"],
              ["Bed Cover", "1 pcs", "Rp25.000"],
              ["Express 6 Jam", "2 kg", "Rp30.000"]
            ].map(([name, qty, price]) => (
              <div key={name} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{name}</p>
                  <p className="text-xs text-muted-foreground">{qty}</p>
                </div>
                <p className="text-sm font-semibold">{price}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t pt-3">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-lg font-bold text-primary">Rp95.000</span>
          </div>
        </div>
      </section>

      <section className="border-t bg-card py-14">
        <div className="container grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border bg-background p-4">
              <Icon className="h-5 w-5 text-primary" />
              <h2 className="mt-3 font-semibold">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
