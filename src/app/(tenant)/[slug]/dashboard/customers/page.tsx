import { ImportedEmptyState } from "@/components/imported-ui";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { storeScope } from "@/lib/db-guard";
import { Search, Users } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type CustomersPageProps = {
  params: {
    slug: string;
  };
};

export default async function CustomersPage({ params }: CustomersPageProps) {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session?.user?.id) redirect(`/${params.slug}/login`);

  const store = await db.store.findFirst({
    where: { slug: params.slug, ownerId: session.user.id },
    select: { id: true },
  });

  if (!store) redirect(`/${params.slug}/login`);

  const customers = await db.customer.findMany({
    where: storeScope(store.id),
    orderBy: { updatedAt: "desc" },
    take: 25,
    select: {
      id: true,
      name: true,
      phone: true,
      notes: true,
      updatedAt: true,
    },
  });

  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-primary">Pelanggan</p>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Pelanggan</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">{customers.length} pelanggan terbaru.</p>
      </div>

      <div className="relative max-w-3xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          className="tap-target w-full rounded-md border bg-card py-2 pl-9 pr-3 text-sm"
          placeholder="Cari pelanggan akan tersedia setelah API pencarian dashboard siap"
          disabled
        />
      </div>

      {customers.length === 0 ? (
        <ImportedEmptyState
          icon={Users}
          title="Belum ada pelanggan"
          description="Pelanggan akan muncul otomatis setelah order dibuat dari POS."
        />
      ) : (
        <div className="grid max-w-3xl gap-2">
          {customers.map((customer) => (
            <article key={customer.id} className="rounded-xl border bg-card p-3 shadow-soft">
              <p className="font-semibold">{customer.name}</p>
              <p className="text-xs text-muted-foreground">{customer.phone || "Nomor belum tersedia"}</p>
              {customer.notes ? <p className="mt-1 text-xs text-muted-foreground">{customer.notes}</p> : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
