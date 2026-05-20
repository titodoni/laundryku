import { useState } from "react";
import { Link } from "react-router-dom";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Shirt, Loader2 } from "lucide-react";

export default function Register() {
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    if (!agree) { setError("Centang persetujuan terlebih dahulu."); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); window.location.href = "/onboarding"; }, 900);
  };

  return (
    <PublicLayout>
      <div className="container flex min-h-[70vh] max-w-md flex-col justify-center py-10">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Shirt className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-xl font-bold">Daftar sebagai Owner</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Akun owner Laundryku menggunakan Google. Cepat, aman, dan tanpa password.
          </p>

          {error && <p className="mt-4 rounded-md bg-destructive-soft px-3 py-2 text-sm text-destructive">{error}</p>}

          <Button onClick={submit} disabled={loading} className="mt-5 w-full tap-target" size="lg">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
            Lanjut dengan Google
          </Button>

          <label className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
            <Checkbox checked={agree} onCheckedChange={v => setAgree(!!v)} className="mt-0.5" />
            <span>Saya setuju dengan Syarat Layanan dan Kebijakan Privasi Laundryku.</span>
          </label>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Sudah punya akun? <Link to="/" className="text-primary hover:underline">Buka tenant Anda</Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}

function GoogleIcon() {
  return <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4c-.2 1.3-.9 2.3-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1H3.1v2.6C4.7 19.8 8.1 22 12 22z"/><path fill="#FBBC05" d="M6.4 13.9c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9V7.5H3.1C2.4 8.9 2 10.4 2 12s.4 3.1 1.1 4.5l3.3-2.6z"/><path fill="#EA4335" d="M12 6.4c1.5 0 2.8.5 3.8 1.5l2.8-2.8C17 3.6 14.7 2.7 12 2.7 8.1 2.7 4.7 4.9 3.1 8.1l3.3 2.6C7.2 8.3 9.4 6.4 12 6.4z"/></svg>;
}