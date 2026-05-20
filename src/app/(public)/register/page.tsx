import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="container flex min-h-screen max-w-md flex-col justify-center py-10">
      <p className="text-sm font-semibold text-primary">Daftar Owner</p>
      <h1 className="mt-2 text-3xl font-bold">Buat akun Laundryku</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Integrasi Google OAuth akan dipasang pada Phase 1. Setelah login, owner masuk ke onboarding.
      </p>
      <Link href="/onboarding" className="tap-target mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">
        Lanjut ke Onboarding
      </Link>
    </main>
  );
}
