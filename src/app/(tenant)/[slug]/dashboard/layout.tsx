import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { ReactNode } from "react";

type DashboardLayoutProps = {
  params: {
    slug: string;
  };
  children: ReactNode;
};

export default async function DashboardLayout({ params, children }: DashboardLayoutProps) {
  const session = await auth.api.getSession({ headers: headers() });

  if (!session?.user?.id) {
    redirect(`/${params.slug}/login`);
  }

  const store = await db.store.findFirst({
    where: {
      slug: params.slug,
      ownerId: session.user.id,
    },
    select: {
      name: true,
      branches: {
        orderBy: {
          createdAt: "asc",
        },
        take: 1,
        select: {
          name: true,
        },
      },
      subscription: {
        select: {
          status: true,
          trialEndsAt: true,
        },
      },
    },
  });

  if (!store) {
    redirect(`/${params.slug}/login`);
  }

  return (
    <DashboardShell
      storeName={store.name}
      userName={session.user.name || "Owner"}
      branchName={store.branches[0]?.name}
      subscriptionStatus={store.subscription?.status ?? null}
      trialEndsAt={store.subscription?.trialEndsAt?.toISOString() ?? null}
    >
      {children}
    </DashboardShell>
  );
}
