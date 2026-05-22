import { BranchSettingsManager } from "@/components/dashboard/branch-settings-manager";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type BranchSettingsPageProps = {
  params: {
    slug: string;
  };
};

export default async function BranchSettingsPage({ params }: BranchSettingsPageProps) {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session?.user?.id) {
    redirect(`/${params.slug}/login`);
  }

  const store = await db.store.findFirst({
    where: { slug: params.slug, ownerId: session.user.id },
    select: {
      id: true,
      name: true,
      slug: true,
      phone: true,
      whatsappPhone: true,
      address: true,
      logoUrl: true,
      defaultSlaHours: true,
      updatedAt: true,
      branches: {
        orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
        select: {
          id: true,
          name: true,
          address: true,
          phone: true,
          code: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!store) {
    redirect(`/${params.slug}/login`);
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-primary">Pengaturan Cabang</p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Pengaturan Cabang</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Atur informasi outlet dan profil operasional laundry.
        </p>
      </div>

      <BranchSettingsManager
        slug={params.slug}
        initialStore={{
          id: store.id,
          name: store.name,
          slug: store.slug,
          phone: store.phone,
          whatsappPhone: store.whatsappPhone,
          address: store.address,
          logoUrl: store.logoUrl,
          defaultSlaHours: store.defaultSlaHours,
          updatedAt: store.updatedAt.toISOString(),
        }}
        initialBranches={store.branches.map((branch) => ({
          id: branch.id,
          name: branch.name,
          address: branch.address,
          phone: branch.phone,
          code: branch.code,
          isActive: branch.isActive,
          createdAt: branch.createdAt.toISOString(),
          updatedAt: branch.updatedAt.toISOString(),
        }))}
      />
    </section>
  );
}
