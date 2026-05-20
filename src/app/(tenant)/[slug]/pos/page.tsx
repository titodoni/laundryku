import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type PosPageProps = {
  params: {
    slug: string;
  };
};

export default async function PosPage({ params }: PosPageProps) {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session?.user?.id) {
    redirect(`/${params.slug}/login`);
  }

  const staff = await db.staffMember.findFirst({
    where: {
      userId: session.user.id,
      isActive: true,
      store: { slug: params.slug },
    },
    select: {
      role: true,
      branch: { select: { name: true } },
      store: { select: { name: true } },
    },
  });

  if (!staff) {
    redirect(`/${params.slug}/login`);
  }

  return (
    <main className="container py-10">
      <p className="text-sm font-semibold text-primary">POS Staff</p>
      <h1 className="mt-2 text-3xl font-bold">{staff.store.name}</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Masuk sebagai {staff.role} di {staff.branch.name}. POS order flow masuk Phase 3.
      </p>
    </main>
  );
}
