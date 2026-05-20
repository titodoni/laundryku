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
      branches: { select: { name: true } },
      subscription: { select: { planType: true, status: true, trialEndsAt: true } },
    },
  });

  if (!store) {
    redirect(`/${params.slug}/login`);
  }

  return (
    <main className="container py-10">
      <p className="text-sm font-semibold text-primary">Dashboard Owner</p>
      <h1 className="mt-2 text-3xl font-bold">{store.name}</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Setup Phase 1 selesai. Dashboard lengkap masuk Phase 2.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-md border bg-card p-4">
          <p className="text-xs text-muted-foreground">Cabang</p>
          <p className="mt-1 text-2xl font-bold">{store.branches.length}</p>
        </div>
        <div className="rounded-md border bg-card p-4">
          <p className="text-xs text-muted-foreground">Plan</p>
          <p className="mt-1 text-2xl font-bold">{store.subscription?.planType || "FREE"}</p>
        </div>
        <div className="rounded-md border bg-card p-4">
          <p className="text-xs text-muted-foreground">Status</p>
          <p className="mt-1 text-2xl font-bold">{store.subscription?.status || "TRIALING"}</p>
        </div>
      </div>
    </main>
  );
}
