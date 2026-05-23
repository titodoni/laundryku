import { RegisterForm } from "./register-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col bg-gradient-soft">
      <div className="container py-4">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-elegant">
          <div className="text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary font-bold text-primary-foreground shadow-glow">L</div>
            <h1 className="mt-4 font-display text-2xl font-bold">Daftar Akun Laundryku</h1>
            <p className="mt-1 text-sm text-muted-foreground">Coba gratis 7 hari, tanpa kartu kredit.</p>
          </div>
          <RegisterForm />
        </div>
      </div>
    </main>
  );
}
