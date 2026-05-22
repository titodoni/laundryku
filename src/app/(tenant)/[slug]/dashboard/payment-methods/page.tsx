import { PaymentMethodsManager } from "@/components/dashboard/payment-methods-manager";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { serializePaymentMethod } from "@/lib/payment-methods";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type PaymentMethodsPageProps = {
  params: {
    slug: string;
  };
};

export default async function PaymentMethodsPage({ params }: PaymentMethodsPageProps) {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session?.user?.id) {
    redirect(`/${params.slug}/login`);
  }

  const store = await db.store.findFirst({
    where: { slug: params.slug, ownerId: session.user.id },
    select: {
      id: true,
      qrisImageUrl: true,
    },
  });

  if (!store) {
    redirect(`/${params.slug}/login`);
  }

  const paymentMethods = await db.paymentMethod.findMany({
    where: { storeId: store.id },
    orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
  });

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-primary">Metode Pembayaran</p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Metode Pembayaran</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Atur metode pembayaran yang tersedia untuk pelanggan.
        </p>
      </div>

      <PaymentMethodsManager
        slug={params.slug}
        initialPaymentMethods={paymentMethods.map(serializePaymentMethod)}
        initialQrisImageUrl={store.qrisImageUrl}
      />
    </section>
  );
}
