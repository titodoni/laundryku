import { redirect } from "next/navigation";

export default function PosLabelRoute({
  params,
}: {
  params: { slug: string; orderCode: string };
}) {
  redirect(`/${params.slug}/orders/${params.orderCode}/label`);
}
