import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const session = await auth.api.getSession({ headers: headers() });

  if (!session?.user?.id) {
    redirect("/register");
  }

  const existingStore = await db.store.findFirst({
    where: { ownerId: session.user.id },
    select: { slug: true },
  });

  if (existingStore) {
    redirect(`/${existingStore.slug}/dashboard`);
  }

  return (
    <main className="container flex min-h-screen max-w-2xl flex-col justify-center py-10">
      <p className="text-sm font-semibold text-primary">Onboarding</p>
      <h1 className="mt-2 text-3xl font-bold">Setup laundry pertama</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Lengkapi data toko, cabang, layanan awal, pembayaran, dan staf pertama.
      </p>
      <OnboardingForm />
    </main>
  );
}
