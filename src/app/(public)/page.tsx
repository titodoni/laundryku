import { formatRupiah } from "@/components/imported-ui";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  HelpCircle,
  Printer,
  QrCode,
  Receipt,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Smartphone,
    title: "Kasir Cepat di HP & Tablet",
    desc: "Antarmuka ringan yang optimal untuk kasir di perangkat mobile. Tanpa perlu komputer mahal.",
  },
  {
    icon: Printer,
    title: "Struk Thermal & QR Label",
    desc: "Cetak struk langsung ke printer thermal. Label kemasan dengan QR untuk tracking otomatis.",
  },
  {
    icon: Users,
    title: "Database Pelanggan Pintar",
    desc: "Cari pelanggan dengan nomor HP, lihat riwayat transaksi, dan total loyalitasnya.",
  },
  {
    icon: BarChart3,
    title: "Laporan Keuangan Otomatis",
    desc: "Pantau pemasukan, pengeluaran, dan laba bersih per cabang secara real-time.",
  },
  {
    icon: ShieldCheck,
    title: "Multi Role & Hak Akses",
    desc: "Atur peran Owner, Kasir, Operator, dan Kurir dengan hak akses yang berbeda.",
  },
  {
    icon: QrCode,
    title: "Tracking Publik Bermerek",
    desc: "Pelanggan cek status cucian via tautan publik dengan branding toko Anda sendiri.",
  },
];

const painPoints = [
  {
    icon: FileText,
    title: "Catatan Pesanan Sering Hilang",
    desc: "Buku catatan manual rusak atau tercampur? Semua pesanan tersimpan rapi dan aman di cloud.",
  },
  {
    icon: Wallet,
    title: "Hitung Omset & Pengeluaran Ribet",
    desc: "Susah tahu untung atau rugi setiap hari? Laporan keuangan otomatis siap kapan saja Anda butuhkan.",
  },
  {
    icon: HelpCircle,
    title: "Pelanggan Sering Tanya Status",
    desc: "Status cucian selalu ter-update real-time. Pelanggan cek sendiri via link, Anda fokus melayani.",
  },
];

const steps = [
  { num: "01", title: "Daftar Akun", desc: "Daftar gratis dengan Google. Tidak perlu kartu kredit." },
  { num: "02", title: "Setup Toko", desc: "Isi nama toko, layanan, harga kiloan, dan cabang dalam 5 menit." },
  { num: "03", title: "Catat Transaksi", desc: "Input pesanan dari HP. Cetak struk thermal dan label QR langsung." },
  { num: "04", title: "Lihat Laporan", desc: "Pantau omset, pengeluaran, dan laba bersih secara otomatis setiap hari." },
];

const faqs = [
  {
    q: "Apakah LaundryKU bisa dipakai di HP biasa?",
    a: "Ya, LaundryKU sepenuhnya berbasis web dan dioptimalkan untuk mobile. Anda bisa mengaksesnya dari HP Android, iPhone, tablet, maupun komputer.",
  },
  {
    q: "Bagaimana cara mencetak struk thermal?",
    a: "Anda bisa menghubungkan printer thermal Bluetooth ke HP atau tablet. Struk akan tercetak otomatis saat pesanan dibuat melalui browser.",
  },
  {
    q: "Apakah data toko saya aman?",
    a: "Sangat aman. Kami menggunakan enkripsi SSL, penyimpanan cloud terenkripsi, dan backup otomatis. Lihat halaman Keamanan Data untuk detail lengkap.",
  },
  {
    q: "Bisa digunakan untuk multi-cabang?",
    a: "Fitur multi-cabang tersedia di plan Pro. Anda bisa mengelola beberapa cabang dalam satu dashboard tanpa perlu akun terpisah.",
  },
  {
    q: "Bagaimana cara berlangganan plan Pro?",
    a: "Anda bisa upgrade ke Pro kapan saja dari dashboard toko. Pembayaran bisa via transfer bank atau e-wallet.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-soft" />
        <div className="container relative grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Coba gratis 7 hari, tanpa kartu kredit
            </div>
            <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Satu Aplikasi,{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Semua Urusan Laundry Tertata
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              Kelola pesanan, cetak struk, pantau keuangan, dan layani pelanggan lebih baik —
              semua dari HP atau tablet. Dibuat khusus untuk laundry kiloan Indonesia.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="h-12 bg-gradient-primary px-6 font-semibold shadow-glow"
              >
                <Link href="/register">
                  Mulai Gratis <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6">
                <Link href="/register">Login Toko</Link>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Check className="h-3.5 w-3.5 text-success" /> Tanpa instalasi
              </span>
              <span className="inline-flex items-center gap-1">
                <Check className="h-3.5 w-3.5 text-success" /> Setup 5 menit
              </span>
              <span className="inline-flex items-center gap-1">
                <Check className="h-3.5 w-3.5 text-success" /> Cetak struk thermal
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-full bg-gradient-primary opacity-20 blur-3xl" />
            <div className="relative mx-auto max-w-sm rounded-2xl border bg-card p-3 shadow-elegant">
              <div className="rounded-xl bg-gradient-primary p-4 text-primary-foreground">
                <p className="text-xs opacity-90">Pemasukan Hari Ini</p>
                <p className="font-display text-3xl font-bold">{formatRupiah(2_340_000)}</p>
                <p className="mt-1 text-xs opacity-90">24 pesanan selesai</p>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Pesanan</p>
                  <p className="font-display font-bold">24</p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Berat</p>
                  <p className="font-display font-bold">142 kg</p>
                </div>
              </div>
              <div className="mt-3 rounded-lg border p-3">
                <div className="flex justify-between text-xs">
                  <span className="font-mono font-bold text-primary">MLT-260521-007</span>
                  <span className="font-semibold text-success">Lunas</span>
                </div>
                <p className="mt-1 text-sm font-semibold">Pak Agus - 7.5 kg</p>
                <p className="text-xs text-muted-foreground">Cuci Kering Setrika</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="border-y bg-card/50">
        <div className="container py-10">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
              <Star className="h-3.5 w-3.5" /> Dipercaya ratusan laundry kiloan di seluruh Indonesia
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center shadow-sm">
              <Zap className="h-6 w-6 text-primary" />
              <p className="text-sm font-semibold">Tanpa Instalasi</p>
              <p className="text-xs text-muted-foreground">Buka browser, login, langsung pakai</p>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center shadow-sm">
              <TrendingUp className="h-6 w-6 text-primary" />
              <p className="text-sm font-semibold">Setup 5 Menit</p>
              <p className="text-xs text-muted-foreground">Daftar, isi data toko, siap transaksi</p>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center shadow-sm">
              <Receipt className="h-6 w-6 text-primary" />
              <p className="text-sm font-semibold">Support Lokal</p>
              <p className="text-xs text-muted-foreground">Tim kami memahami bisnis laundry Indonesia</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="container py-16 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold">
            Bosan dengan Masalah Operasional yang Sama?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Banyak pemilik laundry kiloan mengalami hambatan ini setiap hari. LaundryKU hadir sebagai solusinya.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {painPoints.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border bg-card p-6 transition hover:shadow-elegant"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-destructive-soft text-destructive">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-soft">
        <div className="container py-16 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold">Mulai dalam 4 Langkah Sederhana</h2>
            <p className="mt-3 text-muted-foreground">
              Tidak perlu keahlian teknis. Cukup 5 menit, toko laundry Anda siap beroperasi digital.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.num} className="relative">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {step.num}
                  </span>
                  <div className="h-px flex-1 bg-border lg:block" />
                </div>
                <h3 className="mt-4 font-display font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button asChild size="lg" className="h-12 bg-gradient-primary px-6 font-semibold shadow-glow">
              <Link href="/register">
                Coba Gratis Sekarang <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="fitur" className="container py-16 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold">
            Semua yang Dibutuhkan Laundry Kiloan Modern
          </h2>
          <p className="mt-3 text-muted-foreground">
            Dari mencatat pesanan, mencetak struk thermal, hingga laporan keuangan harian — dalam satu platform.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border bg-card p-6 transition hover:shadow-elegant"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="harga" className="container py-16 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold">Harga Sederhana, Tanpa Kontrak</h2>
          <p className="mt-3 text-muted-foreground">
            Mulai gratis. Upgrade kapan saja sesuai kebutuhan bisnis Anda.
          </p>
        </div>
        <div className="mx-auto mt-10 grid max-w-3xl gap-5 md:grid-cols-2">
          <div className="rounded-2xl border bg-card p-6">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Free</p>
            <p className="mt-2 font-display text-3xl font-bold">
              Rp0<span className="text-sm font-normal text-muted-foreground">/bulan</span>
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              {[
                "10 pesanan per hari",
                "1 staff",
                "Analitik & keuangan hari ini saja",
                "Struk & label dasar",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {item}
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" className="mt-6 w-full">
              <Link href="/register">Mulai Gratis</Link>
            </Button>
          </div>
          <div className="relative rounded-2xl border-2 border-primary bg-gradient-soft p-6 shadow-glow">
            <span className="absolute -top-3 right-4 rounded-full bg-gradient-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              Populer
            </span>
            <p className="text-xs font-semibold uppercase text-primary">Pro</p>
            <p className="mt-2 font-display text-3xl font-bold">
              {formatRupiah(65_000)}
              <span className="text-sm font-normal text-muted-foreground">/bulan</span>
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              {[
                "Pesanan & staff tak terbatas",
                "Multi cabang",
                "Laporan & ekspor data",
                "Tracking publik bermerek",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {item}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-6 w-full bg-gradient-primary shadow-glow">
              <Link href="/register">Coba Pro 7 Hari</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-gradient-soft">
        <div className="container py-16 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold">Pertanyaan yang Sering Diajukan</h2>
            <p className="mt-3 text-muted-foreground">
              Segala sesuatu yang perlu Anda ketahui sebelum memulai dengan LaundryKU.
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-2xl space-y-3">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group rounded-xl border bg-card shadow-sm"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-semibold">
                  {faq.q}
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition group-open:rotate-180" />
                </summary>
                <div className="border-t px-5 pb-4 pt-3 text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10" />
        <div className="container relative py-16 text-center lg:py-24">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
            Siap Mengubah Cara Mengelola Laundry?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Bergabung dengan ratusan pemilik laundry kiloan yang sudah beralih ke sistem digital.
            Gratis 7 hari, tanpa kartu kredit.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="h-12 bg-gradient-primary px-8 font-semibold shadow-glow"
            >
              <Link href="/register">
                Daftar Gratis Sekarang <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-8">
              <Link href="/register">Login Toko</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Tidak perlu kartu kredit · Bisa berhenti kapan saja · Support via WhatsApp
          </p>
        </div>
      </section>
    </main>
  );
}
