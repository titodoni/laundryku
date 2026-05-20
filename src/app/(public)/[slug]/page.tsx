import { db } from "@/lib/db";
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
      whatsappPhone: true,
      branches: { where: { isActive: true }, select: { name: true, address: true } },
    },
  });

  if (!store) {
    notFound();
  }

  return (
    <main className="container grid min-h-screen content-center gap-8 py-10 md:grid-cols-[1fr_320px]">
      <section>
        <p className="text-sm font-semibold text-primary">Laundryku Store</p>
        <h1 className="mt-2 text-4xl font-bold">{store.name}</h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">{store.address}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/${params.slug}/login`} className="tap-target inline-flex items-center rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
            Login toko
          </Link>
          {store.whatsappPhone ? (
            <a href={`https://wa.me/${store.whatsappPhone}`} className="tap-target inline-flex items-center rounded-md border px-5 py-3 text-sm font-semibold">
              WhatsApp
            </a>
          ) : null}
        </div>
      </section>
      <aside className="rounded-md border bg-card p-5">
        <p className="text-sm font-semibold">Cabang aktif</p>
        <div className="mt-4 space-y-3">
          {store.branches.map((branch) => (
            <div key={branch.name} className="rounded-md bg-muted p-3">
              <p className="text-sm font-semibold">{branch.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{branch.address}</p>
            </div>
          ))}
        </div>
      </aside>
    </main>
  );
}
