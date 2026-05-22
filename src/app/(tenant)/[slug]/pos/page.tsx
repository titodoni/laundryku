import { PosApp } from "@/components/pos/pos-app";
import { getPosBootstrap, requireStaffRouteAccess } from "@/lib/pos";
import { staffRoleLabels } from "@/lib/staff";
import { redirect } from "next/navigation";

type PosPageProps = {
  params: {
    slug: string;
  };
};

export default async function PosPage({ params }: PosPageProps) {
  const accessResult = await requireStaffRouteAccess(params.slug);
  if (!accessResult.ok) {
    redirect(`/${params.slug}/login`);
  }

  const access = accessResult.access;
  const bootstrap = await getPosBootstrap(access);

  return (
    <PosApp
      slug={params.slug}
      branchId={access.branchId}
      branchName={access.branchName}
      storeName={access.storeName}
      staffName={access.staffName}
      staffRoleLabel={staffRoleLabels[access.staffRole]}
      qrisImageUrl={access.storeQrisImageUrl}
      services={bootstrap.services}
      paymentMethods={bootstrap.paymentMethods}
    />
  );
}
