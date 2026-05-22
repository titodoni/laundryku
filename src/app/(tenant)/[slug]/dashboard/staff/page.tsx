import { StaffManager } from "@/components/dashboard/staff-manager";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { storeScope } from "@/lib/db-guard";
import { FREE_STAFF_LIMIT, serializeStaffMember, staffSummarySelect } from "@/lib/staff";
import { canAddStaffFromSnapshot } from "@/lib/plan-guard";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type StaffPageProps = {
  params: {
    slug: string;
  };
};

export default async function StaffPage({ params }: StaffPageProps) {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session?.user?.id) {
    redirect(`/${params.slug}/login`);
  }

  const store = await db.store.findFirst({
    where: { slug: params.slug, ownerId: session.user.id },
    select: {
      id: true,
      subscription: {
        select: {
          planType: true,
          status: true,
          trialEndsAt: true,
        },
      },
    },
  });

  if (!store) {
    redirect(`/${params.slug}/login`);
  }

  const [staff, branches, activeStaffCount] = await Promise.all([
    db.staffMember.findMany({
      where: storeScope(store.id),
      orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
      select: staffSummarySelect,
    }),
    db.branch.findMany({
      where: storeScope(store.id),
      orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
      select: {
        id: true,
        name: true,
        isActive: true,
      },
    }),
    db.staffMember.count({
      where: { ...storeScope(store.id), isActive: true },
    }),
  ]);

  const guard = canAddStaffFromSnapshot(store.subscription ?? null, activeStaffCount);

  const limitReached = Boolean(!guard.allowed && guard.reason?.includes("Batas 1 staf"));

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-primary">Staf</p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Staf</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Kelola akun kasir dan staf outlet laundry.
        </p>
      </div>

      <StaffManager
        slug={params.slug}
        initialStaff={staff.map(serializeStaffMember)}
        initialBranches={branches}
        initialMeta={{
          activeStaffCount,
          freeStaffLimit: FREE_STAFF_LIMIT,
          canAddStaff: guard.allowed,
          limitReached,
          limitMessage: limitReached
            ? "Batas staf gratis tercapai. Upgrade ke Pro untuk menambah staf."
            : guard.allowed
              ? null
              : guard.reason ?? null,
          subscription: {
            planType: store.subscription?.planType ?? "FREE",
            status: store.subscription?.status ?? "TRIALING",
            trialEndsAt: store.subscription?.trialEndsAt?.toISOString() ?? null,
          },
        }}
      />
    </section>
  );
}
