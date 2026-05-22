import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { serializeService, serviceQueryInclude } from "@/lib/services";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ServicesManager } from "@/components/dashboard/services-manager";

type ServicesPageProps = {
  params: {
    slug: string;
  };
};

export default async function ServicesPage({ params }: ServicesPageProps) {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session?.user?.id) {
    redirect(`/${params.slug}/login`);
  }

  const store = await db.store.findFirst({
    where: { slug: params.slug, ownerId: session.user.id },
    select: { id: true },
  });

  if (!store) {
    redirect(`/${params.slug}/login`);
  }

  const services = await db.service.findMany({
    where: { storeId: store.id },
    orderBy: [{ isActive: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
    include: serviceQueryInclude,
  });

  const initialServices = services.map((service) => serializeService(service as never));

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-primary">Layanan & Harga</p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Layanan & Harga</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Kelola layanan laundry, harga, dan status aktif.
        </p>
      </div>

      <ServicesManager slug={params.slug} initialServices={initialServices} />
    </section>
  );
}
