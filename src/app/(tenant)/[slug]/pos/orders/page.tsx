import { OrdersBoard } from "@/components/pos/orders-board";
import { getPosBootstrap, requireStaffRouteAccess } from "@/lib/pos";
import { redirect } from "next/navigation";

type PosOrdersPageProps = {
  params: {
    slug: string;
  };
};

export default async function PosOrdersPage({ params }: PosOrdersPageProps) {
  const accessResult = await requireStaffRouteAccess(params.slug);
  if (!accessResult.ok) {
    redirect(`/${params.slug}/login`);
  }

  const access = accessResult.access;
  const bootstrap = await getPosBootstrap(access);

  return (
    <OrdersBoard
      slug={params.slug}
      branchName={access.branchName}
      paymentMethods={bootstrap.paymentMethods}
    />
  );
}
