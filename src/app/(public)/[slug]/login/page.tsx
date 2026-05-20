import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { TenantLoginForm } from "./login-form";

type TenantLoginPageProps = {
  params: {
    slug: string;
  };
};

export default async function TenantLoginPage({ params }: TenantLoginPageProps) {
  const store = await db.store.findUnique({
    where: { slug: params.slug },
    select: { name: true, address: true },
  });

  if (!store) {
    notFound();
  }

  return (
    <main className="container flex min-h-screen max-w-md flex-col justify-center py-10">
      <p className="text-sm font-semibold text-primary">Login toko</p>
      <h1 className="mt-2 text-3xl font-bold">{store.name}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{store.address}</p>
      <TenantLoginForm slug={params.slug} />
    </main>
  );
}
