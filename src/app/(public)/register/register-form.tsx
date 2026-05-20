"use client";

import { authClient } from "@/lib/auth-client";
import { Chrome } from "lucide-react";
import { useState } from "react";

export function RegisterForm() {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function signInWithGoogle() {
    if (!accepted) {
      setError("Centang persetujuan syarat dan ketentuan terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError("");
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/onboarding",
    });
    setLoading(false);
  }

  return (
    <div className="mt-8 space-y-4">
      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive-soft px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <label className="flex items-start gap-3 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(event) => setAccepted(event.target.checked)}
          className="mt-1 size-4 rounded border-input"
        />
        <span>Saya menyetujui syarat layanan dan kebijakan privasi Laundryku.</span>
      </label>
      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={loading}
        className="tap-target inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        <Chrome className="size-4" />
        {loading ? "Membuka Google..." : "Daftar dengan Google"}
      </button>
    </div>
  );
}
