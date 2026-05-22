"use client";

import { Button } from "@/components/ui/button";
import { formatPhoneDisplay } from "@/lib/phone";
import { localizeUploadErrorMessage } from "@/lib/upload";
import { updateBranchSchema } from "@/lib/validations/branch";
import { updateStoreProfileSchema } from "@/lib/validations/store";
import { ImagePlus, Pencil, RefreshCcw, Upload } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { toast } from "sonner";

type StoreProfile = {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  whatsappPhone: string | null;
  address: string | null;
  logoUrl: string | null;
  defaultSlaHours: number;
  updatedAt: string;
};

type BranchSummary = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  code: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type BranchSettingsManagerProps = {
  slug: string;
  initialStore: StoreProfile;
  initialBranches: BranchSummary[];
};

type StoreFormState = {
  name: string;
  phone: string;
  whatsappPhone: string;
  address: string;
  defaultSlaHours: string;
  logoUrl: string;
};

type BranchFormState = {
  name: string;
  address: string;
  phone: string;
  code: string;
};

function toStoreFormState(store: StoreProfile): StoreFormState {
  return {
    name: store.name,
    phone: store.phone ? formatPhoneDisplay(store.phone) : "",
    whatsappPhone: store.whatsappPhone ? formatPhoneDisplay(store.whatsappPhone) : "",
    address: store.address ?? "",
    defaultSlaHours: String(store.defaultSlaHours),
    logoUrl: store.logoUrl ?? "",
  };
}

function toBranchFormState(branch: BranchSummary | null): BranchFormState {
  return {
    name: branch?.name ?? "",
    address: branch?.address ?? "",
    phone: branch?.phone ? formatPhoneDisplay(branch.phone) : "",
    code: branch?.code ?? "",
  };
}

async function readJsonSafe(response: Response) {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as {
      success?: boolean;
      error?: string;
      detail?: string;
      data?: unknown;
    };
  } catch {
    throw new Error("Server mengembalikan respons yang tidak valid");
  }
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function BranchSettingsManager({
  slug,
  initialStore,
  initialBranches,
}: BranchSettingsManagerProps) {
  const [store, setStore] = useState(initialStore);
  const [branches, setBranches] = useState(initialBranches);
  const [selectedBranchId, setSelectedBranchId] = useState(initialBranches[0]?.id ?? "");
  const [storeForm, setStoreForm] = useState<StoreFormState>(() => toStoreFormState(initialStore));
  const [branchForm, setBranchForm] = useState<BranchFormState>(() => toBranchFormState(initialBranches[0] ?? null));
  const [error, setError] = useState("");
  const [savingStore, setSavingStore] = useState(false);
  const [savingBranch, setSavingBranch] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  const selectedBranch = branches.find((branch) => branch.id === selectedBranchId) ?? null;

  useEffect(() => {
    setBranchForm(toBranchFormState(selectedBranch));
  }, [selectedBranchId, selectedBranch]);

  async function refreshBranches() {
    const response = await fetch(`/api/stores/${slug}/branches`, { cache: "no-store" });
    const result = await readJsonSafe(response);

    if (!response.ok || !result?.success || !result.data) {
      throw new Error(result?.error || "Gagal memuat data cabang");
    }

    const payload = result.data as { branches: BranchSummary[] };
    setBranches(payload.branches);

    if (payload.branches.length === 0) {
      setSelectedBranchId("");
      return;
    }

    const stillExists = payload.branches.some((branch) => branch.id === selectedBranchId);
    if (!stillExists) {
      setSelectedBranchId(payload.branches[0].id);
    }
  }

  async function handleStoreSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingStore(true);
    setError("");

    try {
      const parsed = updateStoreProfileSchema.safeParse({
        name: storeForm.name.trim(),
        phone: storeForm.phone.trim(),
        whatsappPhone: storeForm.whatsappPhone.trim(),
        address: storeForm.address.trim(),
        defaultSlaHours: storeForm.defaultSlaHours,
        logoUrl: storeForm.logoUrl.trim(),
      });

      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message || "Data toko belum lengkap");
        setSavingStore(false);
        return;
      }

      const response = await fetch(`/api/stores/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result = await readJsonSafe(response);

      if (!response.ok || !result?.success || !result.data) {
        setError(result?.detail || result?.error || "Gagal menyimpan informasi toko");
        setSavingStore(false);
        return;
      }

      const payload = result.data as {
        store: StoreProfile;
      };

      setStore(payload.store);
      setStoreForm(toStoreFormState(payload.store));
      toast.success("Informasi berhasil disimpan");
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : "Gagal menyimpan informasi toko");
    } finally {
      setSavingStore(false);
    }
  }

  async function handleBranchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedBranch) {
      return;
    }

    setSavingBranch(true);
    setError("");

    try {
      const parsed = updateBranchSchema.safeParse({
        name: branchForm.name.trim(),
        address: branchForm.address.trim(),
        phone: branchForm.phone.trim(),
        code: branchForm.code.trim(),
      });

      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message || "Data cabang belum lengkap");
        setSavingBranch(false);
        return;
      }

      const response = await fetch(`/api/stores/${slug}/branches/${selectedBranch.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result = await readJsonSafe(response);

      if (!response.ok || !result?.success) {
        setError(result?.detail || result?.error || "Gagal menyimpan informasi cabang");
        setSavingBranch(false);
        return;
      }

      toast.success("Informasi berhasil disimpan");
      await refreshBranches();
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : "Gagal menyimpan informasi cabang");
    } finally {
      setSavingBranch(false);
    }
  }

  async function handleLogoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploadingLogo(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("purpose", "store-logo");
      formData.append("slug", slug);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const result = await readJsonSafe(response);

      if (!response.ok || !result?.success || !result.data) {
        setError(localizeUploadErrorMessage(result?.error));
        setUploadingLogo(false);
        return;
      }

      const payload = result.data as { url: string };
      setStoreForm((current) => ({ ...current, logoUrl: payload.url }));
      toast.success("Logo baru siap disimpan");
    } catch (error_) {
      setError(error_ instanceof Error ? localizeUploadErrorMessage(error_.message) : "Upload gagal. Coba lagi.");
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) {
        logoInputRef.current.value = "";
      }
    }
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleStoreSubmit} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-primary">Informasi Toko</p>
          <h2 className="text-lg font-semibold text-foreground">Atur profil toko yang tampil untuk operasional harian.</h2>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">
            Nama Toko
            <input
              value={storeForm.name}
              onChange={(event) => setStoreForm((current) => ({ ...current, name: event.target.value }))}
              className="tap-target rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
              placeholder="Contoh: Melati Laundry"
              required
            />
          </label>

          <label className="grid gap-2 text-sm font-medium">
            Nomor HP
            <input
              value={storeForm.phone}
              onChange={(event) => setStoreForm((current) => ({ ...current, phone: event.target.value }))}
              className="tap-target rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
              placeholder="081234567890"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium">
            Nomor WhatsApp
            <input
              value={storeForm.whatsappPhone}
              onChange={(event) => setStoreForm((current) => ({ ...current, whatsappPhone: event.target.value }))}
              className="tap-target rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
              placeholder="081234567890"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium md:col-span-2">
            Alamat
            <textarea
              value={storeForm.address}
              onChange={(event) => setStoreForm((current) => ({ ...current, address: event.target.value }))}
              className="min-h-28 rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
              placeholder="Alamat toko"
            />
          </label>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="rounded-2xl border border-border/80 bg-muted/20 p-4">
            <p className="text-sm font-semibold text-foreground">SLA Operasional</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Digunakan sebagai acuan estimasi waktu selesai pesanan pelanggan.
            </p>
            <label className="mt-4 grid gap-2 text-sm font-medium">
              SLA Default
              <input
                type="number"
                min="0"
                step="1"
                value={storeForm.defaultSlaHours}
                onChange={(event) =>
                  setStoreForm((current) => ({ ...current, defaultSlaHours: event.target.value }))
                }
                className="tap-target rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                required
              />
            </label>
          </div>

          <div className="rounded-2xl border border-border/80 bg-muted/20 p-4">
            <p className="text-sm font-semibold text-foreground">Logo Toko</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload logo terbaru untuk halaman toko dan identitas dashboard.
            </p>

            <div className="mt-4 flex min-h-48 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-background">
              {storeForm.logoUrl ? (
                <img src={storeForm.logoUrl} alt="Logo toko" className="max-h-48 w-full object-contain" />
              ) : (
                <div className="px-4 text-center text-sm text-muted-foreground">
                  Belum ada logo toko
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <Button
                type="button"
                variant="outline"
                className="tap-target justify-start"
                disabled={uploadingLogo || savingStore}
                onClick={() => logoInputRef.current?.click()}
              >
                {uploadingLogo ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploadingLogo ? "Mengupload..." : "Upload Logo"}
              </Button>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
              <p className="text-xs text-muted-foreground">
                Upload memakai jalur aman toko dengan slug aktif.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-muted-foreground">
            Terakhir tersimpan: {formatDateTime(store.updatedAt ? store.updatedAt : new Date().toISOString())}
          </div>
          <Button type="submit" disabled={savingStore} className="tap-target">
            {savingStore ? (
              <>
                <RefreshCcw className="h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Pencil className="h-4 w-4" />
                Simpan Perubahan
              </>
            )}
          </Button>
        </div>
      </form>

      <form onSubmit={handleBranchSubmit} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-primary">Informasi Cabang</p>
          <h2 className="text-lg font-semibold text-foreground">Kelola data outlet yang dipakai dalam operasional toko.</h2>
        </div>

        {branches.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
            Belum ada cabang
          </div>
        ) : (
          <>
            {branches.length > 1 ? (
              <label className="mt-5 grid gap-2 text-sm font-medium">
                Pilih Cabang
                <select
                  value={selectedBranchId}
                  onChange={(event) => setSelectedBranchId(event.target.value)}
                  className="tap-target rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                >
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                      {branch.isActive ? "" : " (Nonaktif)"}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium">
                Nama Cabang
                <input
                  value={branchForm.name}
                  onChange={(event) => setBranchForm((current) => ({ ...current, name: event.target.value }))}
                  className="tap-target rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                  placeholder="Contoh: Cabang Utama"
                  required
                />
              </label>

              <label className="grid gap-2 text-sm font-medium">
                Kode Cabang
                <input
                  value={branchForm.code}
                  onChange={(event) => setBranchForm((current) => ({ ...current, code: event.target.value }))}
                  className="tap-target rounded-2xl border border-input bg-background px-4 py-3 text-sm uppercase outline-none transition focus:border-primary"
                  placeholder="MLT"
                  required
                />
              </label>

              <label className="grid gap-2 text-sm font-medium">
                Nomor HP
                <input
                  value={branchForm.phone}
                  onChange={(event) => setBranchForm((current) => ({ ...current, phone: event.target.value }))}
                  className="tap-target rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                  placeholder="081234567890"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium md:col-span-2">
                Alamat
                <textarea
                  value={branchForm.address}
                  onChange={(event) => setBranchForm((current) => ({ ...current, address: event.target.value }))}
                  className="min-h-28 rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                  placeholder="Alamat cabang"
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full bg-primary-soft px-3 py-1 font-medium text-primary">
                {selectedBranch?.isActive ? "Cabang aktif" : "Cabang nonaktif"}
              </span>
              {selectedBranch ? <span>Terakhir diubah {formatDateTime(selectedBranch.updatedAt)}</span> : null}
            </div>

            <div className="mt-5 flex justify-end">
              <Button type="submit" disabled={savingBranch} className="tap-target">
                {savingBranch ? (
                  <>
                    <RefreshCcw className="h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Pencil className="h-4 w-4" />
                    Simpan Perubahan
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </form>

      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <ImagePlus className="h-5 w-5" />
          </span>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-primary">Catatan Upload</p>
            <p className="text-sm text-muted-foreground">
              Upload logo toko memakai `purpose=store-logo` dan `slug` aktif. File akan disimpan di prefix toko yang sama dan pembersihan logo lama hanya dicoba setelah URL baru berhasil tersimpan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
