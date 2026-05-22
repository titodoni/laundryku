"use client";

import { slugifyStoreName } from "@/lib/slug";
import { createStoreSchema } from "@/lib/validations/store";
import { ArrowLeft, ArrowRight, Check, Plus, Trash2, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";

const steps = ["Toko", "Cabang", "Layanan", "Pembayaran", "Staf", "Konfirmasi"];

const initialServices = [
  { name: "Cuci Kering", category: "KILOAN" as const, price: 7000, priceMultiplier: null },
  { name: "Setrika Satuan", category: "SATUAN" as const, price: 5000, priceMultiplier: null },
  { name: "Express 6 Jam", category: "EXPRESS" as const, price: 0, priceMultiplier: 1.5 },
];

type ServiceDraft = {
  name: string;
  category: "KILOAN" | "SATUAN" | "EXPRESS" | "ADDON";
  price: number;
  priceMultiplier: number | null;
};

type FieldErrors = Record<string, string>;

function RequiredLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium">
      {children} <span className="text-destructive">*</span>
    </label>
  );
}

function OptionalLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-muted-foreground">
      {children} <span className="text-xs">(opsional)</span>
    </label>
  );
}

export function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [store, setStore] = useState({
    name: "",
    slug: "",
    phone: "",
    whatsappPhone: "",
    address: "",
    logoUrl: "",
  });
  const [branch, setBranch] = useState({ name: "Cabang Utama", code: "UTM", address: "", phone: "" });
  const [services, setServices] = useState<ServiceDraft[]>(initialServices.map((s) => ({ ...s })));
  const [paymentMethods, setPaymentMethods] = useState(["CASH", "TRANSFER", "QRIS"]);
  const [qrisImageUrl, setQrisImageUrl] = useState("");
  const [staff, setStaff] = useState({ enabled: true, name: "", phone: "", role: "CASHIER", pin: "" });

  const generatedSlug = useMemo(() => slugifyStoreName(store.name), [store.name]);
  const effectiveSlug = store.slug || generatedSlug;

  function updateStore(field: keyof typeof store, value: string) {
    setStore((current) => ({ ...current, [field]: field === "slug" ? slugifyStoreName(value) : value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[`store.${field}`];
      return next;
    });
  }

  function updateBranch(field: keyof typeof branch, value: string) {
    setBranch((current) => ({ ...current, [field]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[`branch.${field}`];
      return next;
    });
  }

  async function uploadImage(event: ChangeEvent<HTMLInputElement>, target: "logo" | "qris") {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.set("file", file);
    formData.set("purpose", target === "logo" ? "onboarding-logo" : "onboarding-qris");
    setUploading(target);
    setError("");

    try {
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const payload = await response.json();
      setUploading("");

      if (!response.ok || !payload.success) {
        setError(`Upload ${target === "logo" ? "logo" : "QRIS"} gagal: ${payload.error || "Coba lagi atau lanjut tanpa gambar."}`);
        return;
      }

      if (target === "logo") updateStore("logoUrl", payload.data.url);
      if (target === "qris") setQrisImageUrl(payload.data.url);
    } catch {
      setUploading("");
      setError(`Upload ${target === "logo" ? "logo" : "QRIS"} gagal. Pastikan koneksi stabil atau lanjut tanpa gambar.`);
    }
  }

  function togglePayment(type: string) {
    setPaymentMethods((current) =>
      current.includes(type) ? current.filter((item) => item !== type) : [...current, type]
    );
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next["paymentMethods"];
      return next;
    });
  }

  function addService() {
    setServices((current) => [
      ...current,
      { name: "", category: "KILOAN", price: 0, priceMultiplier: null },
    ]);
  }

  function removeService(index: number) {
    setServices((current) => current.filter((_, i) => i !== index));
  }

  function updateService(index: number, updates: Partial<ServiceDraft>) {
    setServices((current) =>
      current.map((item, i) => (i === index ? { ...item, ...updates } : item))
    );
    setFieldErrors((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        if (k.startsWith("services")) delete next[k];
      });
      return next;
    });
  }

  function validateStep(currentStep: number): boolean {
    const errors: FieldErrors = {};

    if (currentStep === 0) {
      if (!store.name.trim()) errors["store.name"] = "Nama toko wajib diisi";
      if (!store.phone.trim()) errors["store.phone"] = "Nomor telepon toko wajib diisi";
      if (!store.whatsappPhone.trim()) errors["store.whatsappPhone"] = "Nomor WhatsApp wajib diisi";
      if (!store.address.trim()) errors["store.address"] = "Alamat toko wajib diisi";
    }

    if (currentStep === 1) {
      if (!branch.name.trim()) errors["branch.name"] = "Nama cabang wajib diisi";
      if (!branch.code.trim()) errors["branch.code"] = "Kode cabang wajib diisi";
      if (!branch.phone.trim()) errors["branch.phone"] = "Nomor telepon cabang wajib diisi";
      if (!branch.address.trim()) errors["branch.address"] = "Alamat cabang wajib diisi";
    }

    if (currentStep === 2) {
      services.forEach((s, i) => {
        if (!s.name.trim()) errors[`services.${i}.name`] = `Nama layanan ${i + 1} wajib diisi`;
        if (s.category === "EXPRESS") {
          if (!s.priceMultiplier || s.priceMultiplier < 0.1) {
            errors[`services.${i}.priceMultiplier`] = `Multiplier layanan ${i + 1} minimal 0.1`;
          }
        } else {
          if (s.price < 0) errors[`services.${i}.price`] = `Harga layanan ${i + 1} tidak boleh negatif`;
        }
      });
      if (services.length === 0) errors["services"] = "Tambah minimal 1 layanan";
    }

    if (currentStep === 3) {
      if (paymentMethods.length === 0) errors["paymentMethods"] = "Pilih minimal 1 metode pembayaran";
      if (paymentMethods.includes("QRIS") && !qrisImageUrl) {
        errors["qrisImageUrl"] = "Upload gambar QRIS atau hapus pilihan QRIS";
      }
    }

    if (currentStep === 4 && staff.enabled) {
      if (!staff.name.trim()) errors["staff.name"] = "Nama staf wajib diisi";
      if (!staff.phone.trim()) errors["staff.phone"] = "Nomor HP staf wajib diisi";
      if (!/^\d{6}$/.test(staff.pin)) errors["staff.pin"] = "PIN harus 6 digit angka";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function goNext() {
    if (validateStep(step)) {
      setStep((v) => v + 1);
      setError("");
    } else {
      setError("Ada data yang belum lengkap. Periksa kolom bertanda * .");
    }
  }

  function goBack() {
    setStep((v) => v - 1);
    setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateStep(step)) {
      setError("Ada data yang belum lengkap. Periksa kolom bertanda * .");
      return;
    }

    const body = {
      store: { ...store, slug: effectiveSlug },
      branch,
      services,
      paymentMethods,
      qrisImageUrl,
      staff,
    };

    const validation = createStoreSchema.safeParse(body);
    if (!validation.success) {
      const firstIssue = validation.error.issues[0];
      const field = firstIssue?.path?.join(".") || "form";
      setError(`Data belum lengkap pada ${field}: ${firstIssue?.message || ""}`);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json();
      setSubmitting(false);

      if (!response.ok || !payload.success) {
        if (payload.slug) {
          router.push(`/${payload.slug}/dashboard`);
          return;
        }
        setError(payload.detail || payload.error || "Setup toko gagal.");
        return;
      }

      router.push(`/${payload.slug}/dashboard`);
    } catch {
      setSubmitting(false);
      setError("Gagal menghubungi server. Coba lagi.");
    }
  }

  const inputErrorClass = (field: string) =>
    fieldErrors[field] ? "border-destructive focus:border-destructive focus:ring-destructive" : "";

  return (
    <form onSubmit={submit} className="mt-8 space-y-6">
      <div className="grid grid-cols-6 gap-2">
        {steps.map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => index < step && setStep(index)}
            className={`h-2 rounded-full ${index <= step ? "bg-primary" : "bg-border"}`}
            aria-label={label}
          />
        ))}
      </div>

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive-soft px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <section className="rounded-md border bg-card p-5">
        <p className="text-sm font-semibold text-primary">{steps[step]}</p>

        {step === 0 ? (
          <div className="mt-4 grid gap-4">
            <div>
              <RequiredLabel htmlFor="store-name">Nama laundry</RequiredLabel>
              <input
                id="store-name"
                className={`tap-target mt-1 w-full rounded-md border px-3 py-2 text-sm ${inputErrorClass("store.name")}`}
                placeholder="Contoh: Laundry Bersih"
                value={store.name}
                onChange={(e) => updateStore("name", e.target.value)}
                required
              />
              {fieldErrors["store.name"] ? <p className="mt-1 text-xs text-destructive">{fieldErrors["store.name"]}</p> : null}
            </div>
            <div>
              <RequiredLabel htmlFor="store-slug">Slug toko</RequiredLabel>
              <input
                id="store-slug"
                className={`tap-target mt-1 w-full rounded-md border px-3 py-2 text-sm ${inputErrorClass("store.slug")}`}
                placeholder={generatedSlug || "slug-toko"}
                value={effectiveSlug}
                onChange={(e) => updateStore("slug", e.target.value)}
                required
              />
              <p className="mt-1 text-xs text-muted-foreground">URL toko: laundryku.app/{effectiveSlug || "slug"}</p>
            </div>
            <div>
              <RequiredLabel htmlFor="store-phone">Nomor telepon toko</RequiredLabel>
              <input
                id="store-phone"
                className={`tap-target mt-1 w-full rounded-md border px-3 py-2 text-sm ${inputErrorClass("store.phone")}`}
                placeholder="08xxxxxxxxxx"
                value={store.phone}
                onChange={(e) => updateStore("phone", e.target.value)}
                required
              />
              {fieldErrors["store.phone"] ? <p className="mt-1 text-xs text-destructive">{fieldErrors["store.phone"]}</p> : null}
            </div>
            <div>
              <RequiredLabel htmlFor="store-wa">Nomor WhatsApp</RequiredLabel>
              <input
                id="store-wa"
                className={`tap-target mt-1 w-full rounded-md border px-3 py-2 text-sm ${inputErrorClass("store.whatsappPhone")}`}
                placeholder="08xxxxxxxxxx"
                value={store.whatsappPhone}
                onChange={(e) => updateStore("whatsappPhone", e.target.value)}
                required
              />
              {fieldErrors["store.whatsappPhone"] ? <p className="mt-1 text-xs text-destructive">{fieldErrors["store.whatsappPhone"]}</p> : null}
            </div>
            <div>
              <RequiredLabel htmlFor="store-address">Alamat toko</RequiredLabel>
              <textarea
                id="store-address"
                className={`min-h-24 mt-1 w-full rounded-md border px-3 py-2 text-sm ${inputErrorClass("store.address")}`}
                placeholder="Jl. Mawar No. 1, Jakarta"
                value={store.address}
                onChange={(e) => updateStore("address", e.target.value)}
                required
              />
              {fieldErrors["store.address"] ? <p className="mt-1 text-xs text-destructive">{fieldErrors["store.address"]}</p> : null}
            </div>
            <div>
              <OptionalLabel htmlFor="store-logo">Logo toko</OptionalLabel>
              <label className={`tap-target mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm font-medium hover:bg-accent ${inputErrorClass("store.logoUrl")}`}>
                <Upload className="size-4" />
                {uploading === "logo" ? "Mengupload logo..." : store.logoUrl ? "Ganti logo" : "Upload logo"}
                <input id="store-logo" type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage(e, "logo")} />
              </label>
              {store.logoUrl ? (
                <div className="mt-2 flex items-center gap-2">
                  <img src={store.logoUrl} alt="Logo preview" className="h-10 w-10 rounded-md object-cover" />
                  <button type="button" onClick={() => updateStore("logoUrl", "")} className="text-xs text-destructive hover:underline">
                    Hapus logo
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="mt-4 grid gap-4">
            <div>
              <RequiredLabel htmlFor="branch-name">Nama cabang</RequiredLabel>
              <input
                id="branch-name"
                className={`tap-target mt-1 w-full rounded-md border px-3 py-2 text-sm ${inputErrorClass("branch.name")}`}
                placeholder="Cabang Utama"
                value={branch.name}
                onChange={(e) => updateBranch("name", e.target.value)}
                required
              />
              {fieldErrors["branch.name"] ? <p className="mt-1 text-xs text-destructive">{fieldErrors["branch.name"]}</p> : null}
            </div>
            <div>
              <RequiredLabel htmlFor="branch-code">Kode cabang</RequiredLabel>
              <input
                id="branch-code"
                className={`tap-target mt-1 w-full rounded-md border px-3 py-2 text-sm uppercase ${inputErrorClass("branch.code")}`}
                placeholder="UTM"
                value={branch.code}
                onChange={(e) => updateBranch("code", e.target.value.toUpperCase())}
                required
              />
              {fieldErrors["branch.code"] ? <p className="mt-1 text-xs text-destructive">{fieldErrors["branch.code"]}</p> : null}
            </div>
            <div>
              <RequiredLabel htmlFor="branch-phone">Nomor telepon cabang</RequiredLabel>
              <input
                id="branch-phone"
                className={`tap-target mt-1 w-full rounded-md border px-3 py-2 text-sm ${inputErrorClass("branch.phone")}`}
                placeholder="08xxxxxxxxxx"
                value={branch.phone}
                onChange={(e) => updateBranch("phone", e.target.value)}
                required
              />
              {fieldErrors["branch.phone"] ? <p className="mt-1 text-xs text-destructive">{fieldErrors["branch.phone"]}</p> : null}
            </div>
            <div>
              <RequiredLabel htmlFor="branch-address">Alamat cabang</RequiredLabel>
              <textarea
                id="branch-address"
                className={`min-h-24 mt-1 w-full rounded-md border px-3 py-2 text-sm ${inputErrorClass("branch.address")}`}
                placeholder="Jl. Mawar No. 1, Jakarta"
                value={branch.address}
                onChange={(e) => updateBranch("address", e.target.value)}
                required
              />
              {fieldErrors["branch.address"] ? <p className="mt-1 text-xs text-destructive">{fieldErrors["branch.address"]}</p> : null}
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="mt-4 space-y-4">
            {fieldErrors["services"] ? <p className="text-sm text-destructive">{fieldErrors["services"]}</p> : null}
            {services.map((service, index) => (
              <div key={index} className="grid gap-3 rounded-md border p-3 md:grid-cols-[1fr_140px_140px_auto]">
                <div>
                  <label className="text-xs text-muted-foreground">Nama layanan</label>
                  <input
                    className={`tap-target mt-1 w-full rounded-md border px-3 py-2 text-sm ${inputErrorClass(`services.${index}.name`)}`}
                    placeholder="Nama layanan"
                    value={service.name}
                    onChange={(e) => updateService(index, { name: e.target.value })}
                  />
                  {fieldErrors[`services.${index}.name`] ? <p className="mt-1 text-xs text-destructive">{fieldErrors[`services.${index}.name`]}</p> : null}
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Kategori</label>
                  <select
                    className="tap-target mt-1 w-full rounded-md border px-3 py-2 text-sm"
                    value={service.category}
                    onChange={(e) => updateService(index, { category: e.target.value as ServiceDraft["category"] })}
                  >
                    <option value="KILOAN">Kiloan</option>
                    <option value="SATUAN">Satuan</option>
                    <option value="EXPRESS">Express</option>
                    <option value="ADDON">Addon</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">
                    {service.category === "EXPRESS" ? "Multiplier" : "Harga (Rp)"}
                  </label>
                  <input
                    className={`tap-target mt-1 w-full rounded-md border px-3 py-2 text-sm ${inputErrorClass(`services.${index}.${service.category === "EXPRESS" ? "priceMultiplier" : "price"}`)}`}
                    type="number"
                    step={service.category === "EXPRESS" ? "0.1" : "1"}
                    value={service.category === "EXPRESS" ? (service.priceMultiplier ?? 1.5) : service.price}
                    onChange={(e) =>
                      updateService(index, {
                        [service.category === "EXPRESS" ? "priceMultiplier" : "price"]:
                          service.category === "EXPRESS" ? Number(e.target.value) : Number(e.target.value),
                      } as Partial<ServiceDraft>)
                    }
                  />
                  {fieldErrors[`services.${index}.price`] ? <p className="mt-1 text-xs text-destructive">{fieldErrors[`services.${index}.price`]}</p> : null}
                  {fieldErrors[`services.${index}.priceMultiplier`] ? <p className="mt-1 text-xs text-destructive">{fieldErrors[`services.${index}.priceMultiplier`]}</p> : null}
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeService(index)}
                    className="tap-target inline-flex items-center justify-center rounded-md border p-2 text-destructive hover:bg-destructive-soft"
                    title="Hapus layanan"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addService}
              className="tap-target inline-flex w-full items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              <Plus className="size-4" />
              Tambah layanan
            </button>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="mt-4 grid gap-3">
            <p className="text-sm font-medium">Metode pembayaran yang diterima</p>
            {fieldErrors["paymentMethods"] ? <p className="text-xs text-destructive">{fieldErrors["paymentMethods"]}</p> : null}
            {["CASH", "TRANSFER", "QRIS"].map((type) => (
              <label key={type} className="tap-target flex items-center gap-3 rounded-md border px-3 py-2">
                <input type="checkbox" checked={paymentMethods.includes(type)} onChange={() => togglePayment(type)} />
                <span className="text-sm">{type === "CASH" ? "Tunai" : type === "TRANSFER" ? "Transfer" : "QRIS"}</span>
              </label>
            ))}
            {paymentMethods.includes("QRIS") ? (
              <div>
                <label className={`tap-target flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm font-medium hover:bg-accent ${inputErrorClass("qrisImageUrl")}`}>
                  <Upload className="size-4" />
                  {uploading === "qris" ? "Mengupload QRIS..." : qrisImageUrl ? "Ganti QRIS" : "Upload gambar QRIS"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage(e, "qris")} />
                </label>
                {fieldErrors["qrisImageUrl"] ? <p className="mt-1 text-xs text-destructive">{fieldErrors["qrisImageUrl"]}</p> : null}
                {qrisImageUrl ? (
                  <div className="mt-2 flex items-center gap-2">
                    <img src={qrisImageUrl} alt="QRIS preview" className="h-16 w-16 rounded-md object-cover" />
                    <button type="button" onClick={() => setQrisImageUrl("")} className="text-xs text-destructive hover:underline">
                      Hapus QRIS
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        {step === 4 ? (
          <div className="mt-4 grid gap-4">
            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" checked={staff.enabled} onChange={(e) => setStaff({ ...staff, enabled: e.target.checked })} />
              Tambah staf pertama
            </label>
            {staff.enabled ? (
              <>
                <div>
                  <RequiredLabel htmlFor="staff-name">Nama staf</RequiredLabel>
                  <input
                    id="staff-name"
                    className={`tap-target mt-1 w-full rounded-md border px-3 py-2 text-sm ${inputErrorClass("staff.name")}`}
                    placeholder="Nama staf"
                    value={staff.name}
                    onChange={(e) => setStaff({ ...staff, name: e.target.value })}
                  />
                  {fieldErrors["staff.name"] ? <p className="mt-1 text-xs text-destructive">{fieldErrors["staff.name"]}</p> : null}
                </div>
                <div>
                  <RequiredLabel htmlFor="staff-phone">Nomor HP staf</RequiredLabel>
                  <input
                    id="staff-phone"
                    className={`tap-target mt-1 w-full rounded-md border px-3 py-2 text-sm ${inputErrorClass("staff.phone")}`}
                    placeholder="08xxxxxxxxxx"
                    value={staff.phone}
                    onChange={(e) => setStaff({ ...staff, phone: e.target.value })}
                  />
                  {fieldErrors["staff.phone"] ? <p className="mt-1 text-xs text-destructive">{fieldErrors["staff.phone"]}</p> : null}
                </div>
                <div>
                  <RequiredLabel htmlFor="staff-role">Peran</RequiredLabel>
                  <select
                    id="staff-role"
                    className="tap-target mt-1 w-full rounded-md border px-3 py-2 text-sm"
                    value={staff.role}
                    onChange={(e) => setStaff({ ...staff, role: e.target.value })}
                  >
                    <option value="CASHIER">Kasir</option>
                    <option value="OPERATOR">Operator</option>
                    <option value="COURIER">Kurir</option>
                  </select>
                </div>
                <div>
                  <RequiredLabel htmlFor="staff-pin">PIN 6 digit</RequiredLabel>
                  <input
                    id="staff-pin"
                    className={`tap-target mt-1 w-full rounded-md border px-3 py-2 text-sm ${inputErrorClass("staff.pin")}`}
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    value={staff.pin}
                    onChange={(e) => setStaff({ ...staff, pin: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                  />
                  {fieldErrors["staff.pin"] ? <p className="mt-1 text-xs text-destructive">{fieldErrors["staff.pin"]}</p> : null}
                </div>
              </>
            ) : null}
          </div>
        ) : null}

        {step === 5 ? (
          <div className="mt-4 space-y-2 text-sm">
            <p><strong>Toko:</strong> {store.name || "-"}</p>
            <p><strong>Slug:</strong> /{effectiveSlug || "-"}</p>
            <p><strong>Cabang:</strong> {branch.name} ({branch.code})</p>
            <p><strong>Layanan:</strong> {services.length} layanan awal</p>
            <p><strong>Pembayaran:</strong> {paymentMethods.join(", ")}</p>
            <p><strong>Staf:</strong> {staff.enabled ? staff.name || "Belum diisi" : "Dilewati"}</p>
          </div>
        ) : null}
      </section>

      <div className="flex items-center justify-between gap-3">
        <button type="button" disabled={step === 0} onClick={goBack} className="tap-target inline-flex items-center gap-2 rounded-md border px-4 text-sm font-semibold disabled:opacity-40">
          <ArrowLeft className="size-4" />
          Kembali
        </button>
        {step < steps.length - 1 ? (
          <button type="button" onClick={goNext} className="tap-target inline-flex items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">
            Lanjut
            <ArrowRight className="size-4" />
          </button>
        ) : (
          <button type="submit" disabled={submitting} className="tap-target inline-flex items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60">
            <Check className="size-4" />
            {submitting ? "Membuat toko..." : "Buat toko"}
          </button>
        )}
      </div>
    </form>
  );
}
