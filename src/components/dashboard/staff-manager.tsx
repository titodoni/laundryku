"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  createStaffSchema,
  resetStaffPinSchema,
  staffRoleSchema,
  updateStaffSchema,
} from "@/lib/validations/staff";
import { Pencil, Plus, RefreshCcw, ShieldCheck, UserCheck, UserX } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";

type StaffRole = keyof typeof roleOptions;

type BranchOption = {
  id: string;
  name: string;
  isActive: boolean;
};

type StaffItem = {
  id: string;
  userId: string;
  name: string;
  phone: string | null;
  role: StaffRole;
  roleLabel: string;
  branchId: string;
  branchName: string;
  isActive: boolean;
  lastActiveAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type StaffMeta = {
  activeStaffCount: number;
  freeStaffLimit: number;
  canAddStaff: boolean;
  limitReached: boolean;
  limitMessage: string | null;
  subscription: {
    planType: string;
    status: string;
    trialEndsAt: string | null;
  } | null;
};

type StaffManagerProps = {
  slug: string;
  initialStaff: StaffItem[];
  initialBranches: BranchOption[];
  initialMeta: StaffMeta;
};

type StaffFormState = {
  name: string;
  phone: string;
  role: StaffRole;
  branchId: string;
  pin: string;
  isActive: boolean;
};

const roleOptions = {
  CASHIER: "Kasir",
  OPERATOR: "Operator",
  COURIER: "Kurir",
} as const;

const emptyResetState = {
  pin: "",
};

const reactivationLimitMessage =
  "Batas staf gratis tercapai. Upgrade ke Pro untuk mengaktifkan staf tambahan.";

function buildEmptyForm(branches: BranchOption[]): StaffFormState {
  return {
    name: "",
    phone: "",
    role: staffRoleSchema.options[0],
    branchId: branches[0]?.id ?? "",
    pin: "",
    isActive: true,
  };
}

function toEditForm(staff: StaffItem): StaffFormState {
  return {
    name: staff.name,
    phone: staff.phone ?? "",
    role: staff.role,
    branchId: staff.branchId,
    pin: "",
    isActive: staff.isActive,
  };
}

function formatPhone(phone: string | null) {
  if (!phone) return "-";
  return phone.startsWith("62") ? `0${phone.slice(2)}` : phone;
}

function formatDateTime(value: string | null) {
  if (!value) return "Belum ada aktivitas";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatPlanLabel(planType: string | null | undefined) {
  switch (planType) {
    case "PRO":
      return "Pro";
    case "FREE":
      return "Gratis";
    default:
      return "Gratis";
  }
}

function formatSubscriptionStatusLabel(status: string | null | undefined) {
  switch (status) {
    case "TRIALING":
      return "Masa trial";
    case "ACTIVE":
      return "Aktif";
    case "LIMITED":
      return "Terbatas";
    case "CANCELLED":
      return "Dibatalkan";
    case "PAST_DUE":
      return "Menunggak";
    default:
      return "Masa trial";
  }
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

export function StaffManager({
  slug,
  initialStaff,
  initialBranches,
  initialMeta,
}: StaffManagerProps) {
  const [staff, setStaff] = useState(initialStaff);
  const [branches, setBranches] = useState(initialBranches);
  const [meta, setMeta] = useState(initialMeta);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<StaffFormState>(() => buildEmptyForm(initialBranches));
  const [resetForm, setResetForm] = useState(emptyResetState);

  const selectedStaff = useMemo(
    () => staff.find((item) => item.id === editingId || item.id === resettingId) ?? null,
    [editingId, resettingId, staff],
  );
  const showReactivationLimitWarning = meta.limitReached && staff.some((item) => !item.isActive);

  async function refreshStaff() {
    const response = await fetch(`/api/stores/${slug}/staff`, { cache: "no-store" });
    const result = await readJsonSafe(response);

    if (!response.ok || !result?.success || !result.data) {
      throw new Error(result?.error || "Gagal memuat data staf");
    }

    const payload = result.data as {
      staff: StaffItem[];
      branches: BranchOption[];
      meta: StaffMeta;
    };

    setStaff(payload.staff);
    setBranches(payload.branches);
    setMeta(payload.meta);
  }

  function closePanels() {
    setFormOpen(false);
    setEditingId(null);
    setResettingId(null);
    setError("");
    setForm(buildEmptyForm(branches));
    setResetForm(emptyResetState);
  }

  function openCreateForm() {
    setEditingId(null);
    setResettingId(null);
    setError("");
    setForm(buildEmptyForm(branches));
    setFormOpen(true);
  }

  function openEditForm(item: StaffItem) {
    setResettingId(null);
    setError("");
    setEditingId(item.id);
    setForm(toEditForm(item));
    setFormOpen(true);
  }

  function openResetPin(item: StaffItem) {
    setFormOpen(false);
    setEditingId(null);
    setError("");
    setResettingId(item.id);
    setResetForm(emptyResetState);
  }

  function updateForm<K extends keyof StaffFormState>(key: K, value: StaffFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const payload = editingId
        ? {
            name: form.name.trim(),
            phone: form.phone.trim(),
            role: form.role,
            branchId: form.branchId,
            isActive: form.isActive,
          }
        : {
            name: form.name.trim(),
            phone: form.phone.trim(),
            role: form.role,
            branchId: form.branchId,
            pin: form.pin.trim(),
          };

      const parsed = (editingId ? updateStaffSchema : createStaffSchema).safeParse(payload);
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message || "Data staf belum lengkap");
        setSubmitting(false);
        return;
      }

      const response = await fetch(
        editingId ? `/api/stores/${slug}/staff/${editingId}` : `/api/stores/${slug}/staff`,
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        },
      );
      const result = await readJsonSafe(response);

      if (!response.ok || !result?.success) {
        setError(result?.detail || result?.error || "Gagal menyimpan staf");
        setSubmitting(false);
        return;
      }

      toast.success(editingId ? "Data staf diperbarui" : "Staf berhasil ditambahkan");
      await refreshStaff();
      closePanels();
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : "Gagal menyimpan staf");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetPin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!resettingId) return;

    setSubmitting(true);
    setError("");

    try {
      const parsed = resetStaffPinSchema.safeParse({ pin: resetForm.pin.trim() });
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message || "PIN baru tidak valid");
        setSubmitting(false);
        return;
      }

      const response = await fetch(`/api/stores/${slug}/staff/${resettingId}/reset-pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result = await readJsonSafe(response);

      if (!response.ok || !result?.success) {
        setError(result?.detail || result?.error || "Gagal mereset PIN");
        setSubmitting(false);
        return;
      }

      toast.success("PIN staf berhasil direset");
      closePanels();
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : "Gagal mereset PIN");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(item: StaffItem) {
    const nextActive = !item.isActive;
    if (nextActive && meta.limitReached) {
      setError(reactivationLimitMessage);
      return;
    }

    const confirmed = window.confirm(nextActive ? "Aktifkan staf ini?" : "Nonaktifkan staf ini?");
    if (!confirmed) return;

    setError("");

    try {
      const response = await fetch(`/api/stores/${slug}/staff/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextActive }),
      });
      const result = await readJsonSafe(response);

      if (!response.ok || !result?.success) {
        setError(result?.detail || result?.error || "Gagal memperbarui status staf");
        return;
      }

      toast.success(nextActive ? "Staf diaktifkan" : "Staf dinonaktifkan");
      await refreshStaff();
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : "Gagal memperbarui status staf");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-primary">Staf</p>
          <h2 className="text-lg font-semibold text-foreground">Kelola akun kasir dan staf outlet laundry.</h2>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-muted px-3 py-1 font-medium text-muted-foreground">
              {meta.activeStaffCount} staf aktif
            </span>
            <span className="rounded-full bg-primary-soft px-3 py-1 font-medium text-primary">
              Limit gratis {meta.freeStaffLimit} staf
            </span>
            <span className="rounded-full bg-success-soft px-3 py-1 font-medium text-success">
              {formatPlanLabel(meta.subscription?.planType)} · {formatSubscriptionStatusLabel(meta.subscription?.status)}
            </span>
          </div>
        </div>

        <Button onClick={openCreateForm} className="tap-target" disabled={!meta.canAddStaff}>
          <Plus className="h-4 w-4" />
          Tambah Staf
        </Button>
      </div>

      {meta.limitMessage ? (
        <div
          className={cn(
            "rounded-2xl border px-4 py-3 text-sm",
            meta.limitReached
              ? "border-amber-200 bg-amber-50 text-amber-800"
              : "border-border bg-muted/40 text-muted-foreground",
          )}
        >
          {meta.limitReached
            ? "Batas staf gratis tercapai. Upgrade ke Pro untuk menambah staf."
            : meta.limitMessage}
        </div>
      ) : null}

      {showReactivationLimitWarning ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {reactivationLimitMessage}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {formOpen ? (
        <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">{editingId ? "Edit Staf" : "Tambah Staf"}</p>
              <p className="text-sm text-muted-foreground">
                {editingId
                  ? "Perbarui data staf tanpa menampilkan PIN."
                  : "Buat akun staf baru dengan PIN 6 digit yang langsung di-hash."}
              </p>
            </div>
            <button
              type="button"
              onClick={closePanels}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Tutup
            </button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">
              Nama Staf
              <input
                value={form.name}
                onChange={(event) => updateForm("name", event.target.value)}
                className="tap-target rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                placeholder="Contoh: Sari"
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-medium">
              Nomor HP
              <input
                value={form.phone}
                onChange={(event) => updateForm("phone", event.target.value)}
                className="tap-target rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                placeholder="081234567890"
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-medium">
              Role
              <select
                value={form.role}
                onChange={(event) => updateForm("role", event.target.value as StaffRole)}
                className="tap-target rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
              >
                {Object.entries(roleOptions).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-medium">
              Cabang
              <select
                value={form.branchId}
                onChange={(event) => updateForm("branchId", event.target.value)}
                className="tap-target rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                required
              >
                <option value="">Pilih cabang</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                    {branch.isActive ? "" : " (Nonaktif)"}
                  </option>
                ))}
              </select>
            </label>

            {!editingId ? (
              <label className="grid gap-2 text-sm font-medium md:col-span-2">
                PIN
                <input
                  value={form.pin}
                  onChange={(event) => updateForm("pin", event.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="tap-target rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                  placeholder="6 digit PIN"
                  inputMode="numeric"
                  maxLength={6}
                  required
                />
              </label>
            ) : null}

            {editingId ? (
              <label className="flex items-center gap-3 rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm font-medium md:col-span-2">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => updateForm("isActive", event.target.checked)}
                />
                {form.isActive ? "Aktif" : "Nonaktif"}
              </label>
            ) : null}
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="submit" disabled={submitting} className="tap-target">
              {editingId ? "Simpan Perubahan" : "Tambah Staf"}
            </Button>
            <Button type="button" variant="ghost" onClick={closePanels} className="tap-target">
              Batal
            </Button>
          </div>
        </form>
      ) : null}

      {resettingId ? (
        <form onSubmit={handleResetPin} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">Reset PIN</p>
              <p className="text-sm text-muted-foreground">
                {selectedStaff ? `Atur PIN baru untuk ${selectedStaff.name}.` : "Atur PIN baru untuk staf ini."}
              </p>
            </div>
            <button
              type="button"
              onClick={closePanels}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Tutup
            </button>
          </div>

          <div className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm font-medium">
              PIN Baru
              <input
                value={resetForm.pin}
                onChange={(event) => setResetForm({ pin: event.target.value.replace(/\D/g, "").slice(0, 6) })}
                className="tap-target rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                placeholder="6 digit PIN"
                inputMode="numeric"
                maxLength={6}
                required
              />
            </label>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="submit" disabled={submitting} className="tap-target">
              Reset PIN
            </Button>
            <Button type="button" variant="ghost" onClick={closePanels} className="tap-target">
              Batal
            </Button>
          </div>
        </form>
      ) : null}

      {staff.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/70 px-5 py-10 text-center shadow-sm">
          <p className="text-lg font-semibold">Belum ada staf</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Tambahkan staf pertama untuk membantu operasional laundry.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {staff.map((item) => (
            <article key={item.id} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold">{item.name}</h3>
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-medium",
                          item.isActive
                            ? "bg-success-soft text-success"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {item.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{formatPhone(item.phone)}</p>
                  </div>

                  <div className="flex flex-col gap-2 sm:items-end">
                    <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
                      {item.roleLabel}
                    </span>
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                      {item.branchName}
                    </span>
                  </div>
                </div>

                <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                  <div className="rounded-2xl bg-muted/30 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em]">Aktivitas terakhir</p>
                    <p className="mt-1 font-medium text-foreground">{formatDateTime(item.lastActiveAt)}</p>
                  </div>
                  <div className="rounded-2xl bg-muted/30 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em]">Diperbarui</p>
                    <p className="mt-1 font-medium text-foreground">{formatDateTime(item.updatedAt)}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button type="button" variant="outline" className="tap-target" onClick={() => openEditForm(item)}>
                    <Pencil className="h-4 w-4" />
                    Edit Staf
                  </Button>
                  <Button type="button" variant="outline" className="tap-target" onClick={() => openResetPin(item)}>
                    <RefreshCcw className="h-4 w-4" />
                    Reset PIN
                  </Button>
                  <Button
                    type="button"
                    variant={item.isActive ? "ghost" : "secondary"}
                    className="tap-target"
                    disabled={!item.isActive && meta.limitReached}
                    onClick={() => toggleActive(item)}
                    title={!item.isActive && meta.limitReached ? reactivationLimitMessage : undefined}
                  >
                    {item.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    {item.isActive ? "Nonaktifkan" : "Aktifkan"}
                  </Button>
                </div>

                {!item.isActive && meta.limitReached ? (
                  <p className="text-sm text-amber-800">{reactivationLimitMessage}</p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="rounded-3xl border border-border bg-card/80 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
          <div className="space-y-1 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Keamanan PIN</p>
            <p>PIN staf selalu disimpan dalam bentuk hash. Dashboard tidak pernah menampilkan PIN mentah.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
