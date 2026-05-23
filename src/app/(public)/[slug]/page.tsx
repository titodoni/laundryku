import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Phone, Search, Star } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

type StoreHomePageProps = {
  params: {
    slug: string;
  };
};

export default async function StoreHomePage({ params }: StoreHomePageProps) {
  const store = await db.store.findUnique({
    where: { slug: params.slug },
    select: {
      name: true,
      address: true,
      phone: true,
      whatsappPhone: true,
      branches: { where: { isActive: true }, select: { name: true, address: true, phone: true } },
    },
  });

  if (!store) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="bg-gradient-hero text-primary-foreground">
        <div className="container py-10">
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 font-display text-2xl font-bold backdrop-blur">
              {store.name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">{store.name}</h1>
              <p className="inline-flex items-center gap-1 text-sm opacity-90"><Star className="h-3.5 w-3.5 fill-current" /> Laundry aktif</p>
            </div>
          </div>
          <p className="mt-4 max-w-lg opacity-95">{store.address || "Laundry kiloan terpercaya."}</p>
          <div className="mt-6 flex gap-2">
            <Button asChild size="lg" variant="secondary" className="font-semibold">
              <Link href={`/${params.slug}/login`}>Masuk Kasir</Link>
            </Button>
            {store.whatsappPhone || store.phone ? (
              <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/10 font-semibold text-primary-foreground hover:bg-white/20">
                <a href={`https://wa.me/${(store.whatsappPhone || store.phone || "").replace(/\D/g, "")}`}>
                  <Phone className="mr-1.5 h-4 w-4" /> Hubungi Kami
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      <section className="container py-8">
        <div className="rounded-2xl border bg-card p-5 shadow-soft">
          <h2 className="font-display font-bold">Lacak Pesanan Anda</h2>
          <p className="mt-1 text-sm text-muted-foreground">Masukkan nomor pesanan untuk melihat status terbaru.</p>
          <form className="mt-3 flex gap-2" action={`/${params.slug}/orders`} method="get">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input name="orderCode" placeholder="MLT-260519-001" className="h-11 w-full rounded-md border bg-background pl-9 pr-3 font-mono text-sm" />
            </div>
            <Button type="submit" className="h-11 bg-gradient-primary font-semibold shadow-glow">Lacak</Button>
          </form>
          <p className="mt-2 text-xs text-muted-foreground">
            URL tracking: <span className="font-mono">/{params.slug}/orders/NO-PESANAN/track</span>
          </p>
        </div>
      </section>

      <section className="container py-6">
        <h2 className="mb-3 font-display text-lg font-bold">Cabang Kami</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {store.branches.map((branch) => (
            <div key={branch.name} className="rounded-xl border bg-card p-4">
              <p className="font-semibold">{branch.name}</p>
              <p className="mt-1.5 inline-flex items-start gap-1.5 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {branch.address || store.address || "Alamat belum tersedia"}
              </p>
              {branch.phone ? (
                <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" /> {branch.phone}
                </p>
              ) : null}
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" /> Jam operasional mengikuti cabang
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-8 border-t">
        <div className="container flex justify-between py-6 text-xs text-muted-foreground">
          <span>© 2026 {store.name}</span>
          <span>Powered by <Link href="/" className="font-semibold text-primary">Laundryku</Link></span>
        </div>
      </footer>
    </main>
  );
}
