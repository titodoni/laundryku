"use client";

import { Button } from "@/components/ui/button";
import { localizeUploadErrorMessage } from "@/lib/upload";
import { cn } from "@/lib/utils";
import {
  type PaymentMethodSummary,
  paymentTypeLabels,
} from "@/lib/payment-methods";
import { updatePaymentMethodSchema, updatePaymentMethodSettingsSchema } from "@/lib/validations/payment-method";
import { CheckCircle2, CreditCard, Pencil, RefreshCcw, Upload, XCircle } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { toast } from "sonner";

type PaymentMethodsManagerProps = {
  slug: string;
  initialPaymentMethods: PaymentMethodSummary[];
  initialQrisImageUrl: string | null;
};

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

export function PaymentMethodsManager({
  slug,
  initialPaymentMethods,
  initialQrisImageUrl,
}: PaymentMethodsManagerProps) {
  const [paymentMethods, setPaymentMethods] = useState(initialPaymentMethods);
  const [qrisImageUrl, setQrisImageUrl] = useState(initialQrisImageUrl);
  const [qrisDraftUrl, setQrisDraftUrl] = useState(initialQrisImageUrl);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savingQris, setSavingQris] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const sortedMethods = useMemo(
    () =>
      [...paymentMethods].sort((a, b) => {
        if (a.isActive !== b.isActive) {
          return a.isActive ? -1 : 1;
        }
        return a.name.localeCompare(b.name, "id");
      }),
    [paymentMethods],
  );

  const selectedMethod = useMemo(
    () => paymentMethods.find((method) => method.id === editingId) ?? null,
    [editingId, paymentMethods],
  );

  async function refreshPaymentMethods() {
    const response = await fetch(`/api/stores/${slug}/payment-methods`, { cache: "no-store" });
    const result = await readJsonSafe(response);

    if (!response.ok || !result?.success || !result.data) {
      throw new Error(result?.error || "Gagal memuat metode pembayaran");
    }

    const payload = result.data as {
      paymentMethods: PaymentMethodSummary[];
      qrisImageUrl: string | null;
    };

    setPaymentMethods(payload.paymentMethods);
    setQrisImageUrl(payload.qrisImageUrl);
    setQrisDraftUrl(payload.qrisImageUrl);
  }

  async function updateMethodStatus(method: PaymentMethodSummary, isActive: boolean) {
    setError("");
    setLoading(true);

    try {
      const parsed = updatePaymentMethodSchema.safeParse({ isActive });
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message || "Status metode pembayaran tidak valid");
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/stores/${slug}/payment-methods/${method.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result = await readJsonSafe(response);

      if (!response.ok || !result?.success) {
        setError(result?.detail || result?.error || "Gagal memperbarui metode pembayaran");
        setLoading(false);
        return;
      }

      toast.success(isActive ? "Metode pembayaran diaktifkan" : "Metode pembayaran dinonaktifkan");
      await refreshPaymentMethods();
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : "Gagal memperbarui metode pembayaran");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !selectedMethod || selectedMethod.type !== "QRIS") {
      return;
    }

    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("purpose", "qris");
      formData.append("slug", slug);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadResult = await readJsonSafe(uploadResponse);

      if (!uploadResponse.ok || !uploadResult?.success || !uploadResult.data) {
        setError(localizeUploadErrorMessage(uploadResult?.error));
        setUploading(false);
        return;
      }

      const uploadPayload = uploadResult.data as { url: string };
      setQrisDraftUrl(uploadPayload.url);
      toast.success("QRIS baru siap disimpan");
    } catch (error_) {
      setError(error_ instanceof Error ? localizeUploadErrorMessage(error_.message) : "Upload gagal. Coba lagi.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function saveQrisImage() {
    setError("");
    setSavingQris(true);

    try {
      const parsed = updatePaymentMethodSettingsSchema.safeParse({ qrisImageUrl: qrisDraftUrl });
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message || "URL QRIS tidak valid");
        setSavingQris(false);
        return;
      }

      const response = await fetch(`/api/stores/${slug}/payment-methods`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result = await readJsonSafe(response);

      if (!response.ok || !result?.success) {
        setError(result?.detail || result?.error || "Gagal menyimpan gambar QRIS");
        setSavingQris(false);
        return;
      }

      toast.success("Gambar QRIS diperbarui");
      await refreshPaymentMethods();
      setEditingId(null);
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : "Gagal menyimpan gambar QRIS");
    } finally {
      setSavingQris(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <p className="text-sm font-semibold text-primary">Metode Pembayaran</p>
        <h2 className="mt-1 text-lg font-semibold text-foreground">
          Metode pembayaran akan digunakan saat transaksi POS.
        </h2>
      </div>

      {error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {sortedMethods.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card px-5 py-10 text-center shadow-sm">
          <p className="text-base font-semibold text-foreground">Belum ada metode pembayaran</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Metode pembayaran akan digunakan saat transaksi POS.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sortedMethods.map((method) => {
            const isEditing = editingId === method.id;
            const canUploadQris = method.type === "QRIS";

            return (
              <article key={method.id} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                        <CreditCard className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="text-base font-semibold text-foreground">{method.name}</h3>
                        <p className="text-sm text-muted-foreground">Tipe: {paymentTypeLabels[method.type]}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-1 font-semibold",
                          method.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-600",
                        )}
                      >
                        {method.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                      <span>Jenis: {method.typeLabel}</span>
                      <span>Terakhir diubah {formatDateTime(method.updatedAt)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="tap-target"
                      onClick={() => setEditingId((current) => (current === method.id ? null : method.id))}
                    >
                      <Pencil className="h-4 w-4" />
                      Ubah
                    </Button>
                    <Button
                      type="button"
                      variant={method.isActive ? "outline" : "default"}
                      className="tap-target"
                      disabled={loading}
                      onClick={() => updateMethodStatus(method, !method.isActive)}
                    >
                      {method.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                      {method.isActive ? "Nonaktifkan" : "Aktifkan"}
                    </Button>
                  </div>
                </div>

                {isEditing ? (
                  <div className="mt-5 rounded-2xl border border-border/80 bg-muted/20 p-4">
                    <div className="flex flex-col gap-4">
                      <div className="grid gap-2">
                        <span className="text-sm font-medium text-foreground">Nama Tampilan</span>
                        <div className="rounded-2xl border border-input bg-background px-4 py-3 text-sm text-foreground">
                          {method.name}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Nama tampilan belum memiliki field khusus di schema saat ini.
                        </p>
                      </div>

                      <div className="grid gap-2">
                        <span className="text-sm font-medium text-foreground">Status</span>
                        <div className="rounded-2xl border border-input bg-background px-4 py-3 text-sm text-foreground">
                          {method.isActive ? "Aktif" : "Nonaktif"}
                        </div>
                      </div>

                      {canUploadQris ? (
                        <div className="grid gap-4">
                          <div className="grid gap-2">
                            <span className="text-sm font-medium text-foreground">QRIS</span>
                            <p className="text-sm text-muted-foreground">
                              Upload QRIS terbaru agar pelanggan dapat membayar dengan kode yang benar.
                            </p>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_11rem]">
                            <div className="rounded-2xl border border-dashed border-border bg-background p-4">
                              <div className="flex min-h-44 items-center justify-center overflow-hidden rounded-2xl bg-muted/30">
                                {qrisDraftUrl ? (
                                  <img
                                    src={qrisDraftUrl}
                                    alt="QRIS"
                                    className="max-h-72 w-full rounded-2xl object-contain"
                                  />
                                ) : (
                                  <div className="px-4 text-center text-sm text-muted-foreground">
                                    Belum ada gambar QRIS
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col gap-3">
                              <Button
                                type="button"
                                variant="outline"
                                className="tap-target justify-start"
                                disabled={uploading || savingQris}
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <Upload className="h-4 w-4" />
                                {uploading ? "Mengupload..." : "Upload QRIS"}
                              </Button>
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleUpload}
                              />
                              <div className="rounded-2xl border border-border bg-background px-4 py-3 text-xs text-muted-foreground">
                                Maksimal 2MB. Gunakan format gambar yang jelas dan mudah dipindai.
                              </div>
                              <Button
                                type="button"
                                className="tap-target"
                                disabled={uploading || savingQris || qrisDraftUrl === qrisImageUrl}
                                onClick={saveQrisImage}
                              >
                                {savingQris ? "Menyimpan..." : "Simpan Perubahan"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {!canUploadQris ? (
                        <div className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
                          Pengaturan tambahan untuk metode ini belum diperlukan pada fase ini.
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}

      <div className="flex justify-end">
        <Button type="button" variant="ghost" className="tap-target" disabled={loading || uploading} onClick={refreshPaymentMethods}>
          <RefreshCcw className="h-4 w-4" />
          Muat Ulang
        </Button>
      </div>
    </div>
  );
}
