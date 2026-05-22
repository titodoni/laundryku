import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type DashboardPageProps = {
  params: {
    slug: string;
  };
};

export default async function DashboardPage({ params }: DashboardPageProps) {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session?.user?.id) {
    redirect(`/${params.slug}/login`);
  }

  const store = await db.store.findFirst({
    where: { slug: params.slug, ownerId: session.user.id },
    select: {
      name: true,
      branches: {
        orderBy: {
          createdAt: "asc",
        },
        select: { name: true },
      },
      subscription: { select: { planType: true, status: true, trialEndsAt: true } },
    },
  });

  if (!store) {
    redirect(`/${params.slug}/login`);
  }

  return (
    <section className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm font-semibold text-primary">Ringkasan dashboard</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{store.name}</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Shell dashboard sudah aktif. Slice berikutnya akan mengisi ringkasan operasional, staf, layanan, dan pengaturan cabang.
        </p>
        <div className="mt-6 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-primary-soft px-3 py-1 font-medium text-primary">
            {store.subscription?.planType || "FREE"}
          </span>
          <span className="rounded-full bg-muted px-3 py-1 font-medium text-muted-foreground">
            {store.subscription?.status || "TRIALING"}
          </span>
          <span className="rounded-full bg-success-soft px-3 py-1 font-medium text-success">
            {store.branches.length} cabang siap
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Langkah berikutnya</p>
          <p className="mt-2 text-sm font-semibold">Isi menu operasional per modul</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Ringkasan, Pesanan, Pelanggan, Staf, Layanan & Harga, Metode Pembayaran, dan Pengaturan Cabang akan diisi bertahap.
          </p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Catatan phase</p>
          <p className="mt-2 text-sm font-semibold">Billing masih future</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Menu Billing sengaja dikunci agar tidak terlihat seperti alur yang sudah selesai.
          </p>
        </div>
      </div>
    </section>
  );
}
