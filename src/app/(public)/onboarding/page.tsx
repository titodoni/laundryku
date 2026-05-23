import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CreditCard, MapPin, Sparkles, Store } from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { OnboardingForm } from "./onboarding-form";

const steps = [
  { icon: Store, title: "Profil Usaha" },
  { icon: MapPin, title: "Cabang" },
  { icon: Sparkles, title: "Layanan" },
  { icon: CreditCard, title: "Bayar" },
];

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
    <main className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary font-bold text-primary-foreground">L</div>
            <span className="font-display font-bold">Laundryku</span>
          </Link>
          <span className="text-xs text-muted-foreground">Setup toko baru</span>
        </div>
      </header>

      <div className="container max-w-2xl py-6">
        <ol className="mb-6 flex items-center gap-2">
          {steps.map((step, index) => (
            <li key={step.title} className="flex flex-1 flex-col items-center">
              <div className={`grid h-9 w-9 place-items-center rounded-full border-2 ${
                index === 0 ? "border-primary bg-primary-soft text-primary" : "border-border bg-card text-muted-foreground"
              }`}>
                <step.icon className="h-4 w-4" />
              </div>
              <span className={`mt-1.5 text-center text-[10px] font-medium ${index === 0 ? "text-primary" : "text-muted-foreground"}`}>
                {step.title}
              </span>
            </li>
          ))}
        </ol>

        <div className="mb-4">
          <p className="text-sm font-semibold text-primary">Onboarding</p>
          <h1 className="mt-2 font-display text-3xl font-bold">Setup laundry pertama</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Lengkapi data toko, cabang, layanan awal, pembayaran, dan staf pertama.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-soft">
          <OnboardingForm />
        </div>
      </div>
    </main>
  );
}
