"use client";

import { authClient } from "@/lib/auth-client";
import { Chrome, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function TenantLoginForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<"owner" | "staff">("staff");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function ownerLogin() {
    setLoading(true);
    await authClient.signIn.social({
      provider: "google",
      callbackURL: `/${slug}/dashboard`,
    });
    setLoading(false);
  }

  async function staffLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch(`/api/stores/${slug}/staff-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, pin }),
    });
    const payload = await response.json();
    setLoading(false);

    if (!response.ok || !payload.success) {
      setError(payload.error || "Login staf gagal");
      return;
    }

    router.push(`/${slug}/pos`);
    router.refresh();
  }

  return (
    <div className="mt-8 rounded-md border bg-card p-5">
      <div className="grid grid-cols-2 rounded-md bg-muted p-1">
        <button type="button" onClick={() => setTab("staff")} className={`tap-target rounded-md text-sm font-semibold ${tab === "staff" ? "bg-background shadow-sm" : ""}`}>
          Staf PIN
        </button>
        <button type="button" onClick={() => setTab("owner")} className={`tap-target rounded-md text-sm font-semibold ${tab === "owner" ? "bg-background shadow-sm" : ""}`}>
          Owner Google
        </button>
      </div>

      {error ? (
        <p className="mt-4 rounded-md border border-destructive/30 bg-destructive-soft px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {tab === "owner" ? (
        <button type="button" onClick={ownerLogin} disabled={loading} className="tap-target mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">
          <Chrome className="size-4" />
          {loading ? "Membuka Google..." : "Masuk sebagai owner"}
        </button>
      ) : (
        <form onSubmit={staffLogin} className="mt-5 grid gap-4">
          <div>
            <label htmlFor="staff-phone" className="block text-sm font-medium">
              Nomor HP staf <span className="text-destructive">*</span>
            </label>
            <input
              id="staff-phone"
              className="tap-target mt-1 w-full rounded-md border px-3 py-2 text-sm"
              placeholder="08xxxxxxxxxx"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="staff-pin" className="block text-sm font-medium">
              PIN 6 digit <span className="text-destructive">*</span>
            </label>
            <input
              id="staff-pin"
              className="tap-target mt-1 w-full rounded-md border px-3 py-2 text-sm"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={pin}
              onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 6))}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="tap-target inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">
            <LockKeyhole className="size-4" />
            {loading ? "Memeriksa..." : "Masuk POS"}
          </button>
        </form>
      )}
    </div>
  );
}
