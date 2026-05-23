import { redirect } from "next/navigation";

export default function PublicOrderLookupPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { orderCode?: string };
}) {
  const orderCode = searchParams.orderCode?.trim();

  if (orderCode) {
    redirect(`/${params.slug}/orders/${encodeURIComponent(orderCode)}/track`);
  }

  redirect(`/${params.slug}`);
}
