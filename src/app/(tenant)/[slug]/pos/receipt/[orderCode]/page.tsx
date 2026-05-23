import { redirect } from "next/navigation";

export default function PosReceiptRoute({
  params,
}: {
  params: { slug: string; orderCode: string };
}) {
  redirect(`/${params.slug}/orders/${params.orderCode}/receipt`);
}
