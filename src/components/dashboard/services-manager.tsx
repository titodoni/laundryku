"use client";

import { Button } from "@/components/ui/button";
import {
  formatIDR,
  getServiceDisplayPrice,
  serviceCategoryLabels,
  type ServiceSummary,
} from "@/lib/services";
import { createServiceSchema, updateServiceSchema } from "@/lib/validations/service";
import { Pencil, Plus, RefreshCcw, CheckCircle2, XCircle } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";

type ServiceFormState = {
  name: string;
  category: ServiceSummary["category"];
  price: string;
  priceMultiplier: string;
  baseServiceId: string;
  isActive: boolean;
};

type ServicesManagerProps = {
  slug: string;
  initialServices: ServiceSummary[];
};

const emptyFormState: ServiceFormState = {
  name: "",
  category: "KILOAN",
  price: "0",
  priceMultiplier: "1.5",
  baseServiceId: "",
  isActive: true,
};

function serviceToFormState(service: ServiceSummary): ServiceFormState {
  return {
    name: service.name,
    category: service.category,
    price: String(service.price),
    priceMultiplier: service.priceMultiplier != null ? String(service.priceMultiplier) : "1.5",
    baseServiceId: service.baseServiceId ?? "",
    isActive: service.isActive,
  };
}

export function ServicesManager({ slug, initialServices }: ServicesManagerProps) {
  const [services, setServices] = useState(initialServices);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<ServiceFormState>(emptyFormState);

  const kiloanServices = useMemo(
    () => services.filter((service) => service.category === "KILOAN"),
    [services],
  );

  const baseService = useMemo(
    () => services.find((service) => service.id === form.baseServiceId) ?? null,
    [form.baseServiceId, services],
  );

  function getExpressPrice(baseServiceId: string, multiplierValue: string) {
    const selected = kiloanServices.find((service) => service.id === baseServiceId);
    const basePrice = selected ? getServiceDisplayPrice(selected) : 0;
    return Math.round(basePrice * Number(multiplierValue || 0));
  }

  const previewPrice = useMemo(() => {
    if (form.category === "EXPRESS") {
      const basePrice = baseService ? getServiceDisplayPrice(baseService) : 0;
      const multiplier = Number(form.priceMultiplier || 0);
      return Math.round(basePrice * multiplier);
    }

    return Number(form.price || 0);
  }, [baseService, form.category, form.price, form.priceMultiplier]);

  const sortedServices = useMemo(
    () =>
      [...services].sort((a, b) => {
        if (a.isActive !== b.isActive) {
          return a.isActive ? -1 : 1;
        }
        return a.sortOrder - b.sortOrder;
      }),
    [services],
  );

  async function refreshServices() {
    const response = await fetch(`/api/stores/${slug}/services?includeInactive=1`);
    const payload = await response.json();
    if (!response.ok || !payload.success) {
      throw new Error(payload.error || "Gagal memuat layanan");
    }
    setServices(payload.data.services);
  }

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyFormState);
    setError("");
    setFormOpen(true);
  }

  function openEditForm(service: ServiceSummary) {
    setEditingId(service.id);
    setForm(serviceToFormState(service));
    setError("");
    setFormOpen(true);
  }

  function updateForm<K extends keyof ServiceFormState>(key: K, value: ServiceFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const payload = {
        name: form.name.trim(),
        category: form.category,
        price: previewPrice,
        priceMultiplier: form.category === "EXPRESS" ? Number(form.priceMultiplier || 0) : null,
        baseServiceId: form.category === "EXPRESS" ? form.baseServiceId || null : null,
        isActive: form.isActive,
      };

      const schema = editingId ? updateServiceSchema : createServiceSchema;
      const parsed = schema.safeParse(payload);
      if (!parsed.success) {
        const issue = parsed.error.issues[0];
        setError(issue?.message || "Data layanan belum lengkap");
        setSubmitting(false);
        return;
      }

      const response = await fetch(
        editingId
          ? `/api/stores/${slug}/services/${editingId}`
          : `/api/stores/${slug}/services`,
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        },
      );
      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.detail || result.error || "Gagal menyimpan layanan");
        setSubmitting(false);
        return;
      }

      toast.success(editingId ? "Layanan diperbarui" : "Layanan ditambahkan");
      await refreshServices();
      setFormOpen(false);
      setEditingId(null);
      setForm(emptyFormState);
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : "Gagal menyimpan layanan");
    } finally {
      setSubmitting(false);
    }
  }

  async function deactivateService(serviceId: string) {
    if (!window.confirm("Nonaktifkan layanan ini?")) return;
    setError("");

    try {
      const response = await fetch(`/api/stores/${slug}/services/${serviceId}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.detail || result.error || "Gagal menonaktifkan layanan");
        return;
      }

      toast.success("Layanan dinonaktifkan");
      await refreshServices();
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : "Gagal menonaktifkan layanan");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Layanan & Harga</p>
          <h2 className="text-lg font-semibold text-foreground">Kelola layanan laundry, harga, dan status aktif.</h2>
        </div>
        <Button onClick={openCreateForm} className="tap-target">
          <Plus className="h-4 w-4" />
          Tambah Layanan
        </Button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive-soft px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {formOpen ? (
        <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">{editingId ? "Edit Layanan" : "Tambah Layanan"}</p>
              <p className="text-sm text-muted-foreground">
                {editingId ? "Perbarui detail layanan yang sudah ada." : "Tambahkan layanan baru untuk POS Laundryku."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFormOpen(false);
                setEditingId(null);
                setError("");
              }}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Tutup
            </button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">
              Nama Layanan
              <input
                value={form.name}
                onChange={(event) => updateForm("name", event.target.value)}
                className="tap-target rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                placeholder="Contoh: Cuci Kering"
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-medium">
              Kategori
              <select
                value={form.category}
                onChange={(event) => {
                  const category = event.target.value as ServiceFormState["category"];
                  setForm((current) => {
                    const nextBaseServiceId =
                      category === "EXPRESS" ? current.baseServiceId || kiloanServices[0]?.id || "" : "";
                    const nextMultiplier = category === "EXPRESS" ? current.priceMultiplier || "1.5" : "";
                    return {
                      ...current,
                      category,
                      baseServiceId: nextBaseServiceId,
                      priceMultiplier: nextMultiplier,
                      price:
                        category === "EXPRESS"
                          ? String(getExpressPrice(nextBaseServiceId, nextMultiplier))
                          : current.price,
                    };
                  });
                }}
                className="tap-target rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
              >
                <option value="KILOAN">Kiloan</option>
                <option value="SATUAN">Satuan</option>
                <option value="EXPRESS">Express</option>
                <option value="ADDON">Addon</option>
              </select>
            </label>

            {form.category === "EXPRESS" ? (
              <>
                <label className="grid gap-2 text-sm font-medium">
                  Layanan Dasar
                  <select
                    value={form.baseServiceId}
                    onChange={(event) => updateForm("baseServiceId", event.target.value)}
                    className="tap-target rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                    required
                  >
                    <option value="">Pilih layanan dasar</option>
                    {kiloanServices.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2 text-sm font-medium">
                  Multiplier
                  <input
                    type="number"
                    min="0.1"
                    max="10"
                    step="0.1"
                    value={form.priceMultiplier}
                    onChange={(event) => {
                      const multiplier = event.target.value;
                      updateForm("priceMultiplier", multiplier);
                      updateForm("price", String(getExpressPrice(form.baseServiceId, multiplier)));
                    }}
                    className="tap-target rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                    required
                  />
                </label>
              </>
            ) : null}

            <label className="grid gap-2 text-sm font-medium">
              Harga
              <input
                type="number"
                min="0"
                step="1"
                value={form.price}
                onChange={(event) => updateForm("price", event.target.value)}
                className="tap-target rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                readOnly={form.category === "EXPRESS"}
                required
              />
              {form.category === "EXPRESS" ? (
                <span className="text-xs text-muted-foreground">
                  Harga dihitung dari layanan dasar dan multiplier.
                </span>
              ) : null}
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm font-medium">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => updateForm("isActive", event.target.checked)}
              />
              Aktif
            </label>
          </div>

          {form.category === "EXPRESS" ? (
            <div className="mt-4 rounded-2xl border border-dashed border-border bg-muted/20 p-4 text-sm">
              <p className="font-medium">Pratinjau harga: {formatIDR(previewPrice)}</p>
              <p className="mt-1 text-muted-foreground">
                Express akan disimpan dengan relasi ke layanan dasar dan multiplier yang dipilih.
              </p>
            </div>
          ) : null}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="submit" disabled={submitting} className="tap-target">
              {submitting ? (
                <>
                  <RefreshCcw className="h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : editingId ? (
                <>
                  <Pencil className="h-4 w-4" />
                  Simpan Perubahan
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Tambah Layanan
                </>
              )}
            </Button>
          </div>
        </form>
      ) : null}

      {sortedServices.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-8 text-center shadow-sm">
          <p className="text-lg font-semibold">Belum ada layanan</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Tambahkan layanan pertama untuk mulai memakai POS Laundryku.
          </p>
          <Button onClick={openCreateForm} variant="outline" className="mt-5">
            <Plus className="h-4 w-4" />
            Tambah Layanan
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sortedServices.map((service) => {
            const displayPrice = getServiceDisplayPrice(service);
            return (
              <article key={service.id} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold">{service.name}</p>
                    <span className="mt-2 inline-flex rounded-full bg-primary-soft px-3 py-1 text-[11px] font-semibold text-primary">
                      {serviceCategoryLabels[service.category]}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                      service.isActive
                        ? "bg-success-soft text-success"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {service.isActive ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                    {service.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Harga</span>
                    <span className="font-semibold tabular-nums">{formatIDR(displayPrice)}</span>
                  </div>
                  {service.category === "EXPRESS" ? (
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Relasi Express</span>
                      <span className="text-right font-medium">
                        {service.baseServiceName || "-"}
                        {service.priceMultiplier != null ? ` × ${service.priceMultiplier}` : ""}
                      </span>
                    </div>
                  ) : null}
                </div>

                <div className="mt-5 flex gap-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => openEditForm(service)}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  {service.isActive ? (
                    <Button
                      type="button"
                      variant="secondary"
                      className="flex-1"
                      onClick={() => deactivateService(service.id)}
                    >
                      Nonaktifkan
                    </Button>
                  ) : (
                    <Button type="button" variant="secondary" className="flex-1" disabled>
                      Nonaktif
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
