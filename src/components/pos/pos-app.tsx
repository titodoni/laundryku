"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import type { PaymentMethodSummary } from "@/lib/payment-methods";
import type { CustomerSummary } from "@/lib/pos";
import { formatPhoneDisplay } from "@/lib/phone";
import { formatIDR, getServiceDisplayPrice, serviceCategoryLabels, type ServiceSummary } from "@/lib/services";
import { Loader2, LogOut, Plus, ReceiptText, Search, ShoppingCart, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type PosAppProps = {
  slug: string;
  branchId: string;
  branchName: string;
  storeName: string;
  staffName: string;
  staffRoleLabel: string;
  qrisImageUrl: string | null;
  services: ServiceSummary[];
  paymentMethods: PaymentMethodSummary[];
};

type CartItem = {
  tempId: string;
  serviceId: string;
  serviceName: string;
  category: ServiceSummary["category"];
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes: string;
};

type CreateCustomerForm = {
  name: string;
  phone: string;
  notes: string;
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

const categoryOrder: ServiceSummary["category"][] = ["KILOAN", "SATUAN", "EXPRESS", "ADDON"];

export function PosApp({
  slug,
  branchId,
  branchName,
  storeName,
  staffName,
  staffRoleLabel,
  qrisImageUrl,
  services,
  paymentMethods,
}: PosAppProps) {
  const router = useRouter();
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerResults, setCustomerResults] = useState<CustomerSummary[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);
  const [searchingCustomers, setSearchingCustomers] = useState(false);
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const [customerForm, setCustomerForm] = useState<CreateCustomerForm>({ name: "", phone: "", notes: "" });
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ServiceSummary["category"]>("KILOAN");
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(services[0]?.id ?? null);
  const [quantityInput, setQuantityInput] = useState("1000");
  const [itemNotes, setItemNotes] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentType, setPaymentType] = useState<"LUNAS" | "DP" | "BELUM_BAYAR">("LUNAS");
  const [paymentMethodId, setPaymentMethodId] = useState(paymentMethods[0]?.id ?? "");
  const [paidAmountInput, setPaidAmountInput] = useState("0");
  const [submittingOrder, setSubmittingOrder] = useState(false);

  const filteredServices = useMemo(
    () => services.filter((service) => service.category === activeCategory),
    [activeCategory, services],
  );

  const selectedService = useMemo(
    () => services.find((service) => service.id === selectedServiceId) ?? filteredServices[0] ?? null,
    [filteredServices, selectedServiceId, services],
  );

  useEffect(() => {
    if (!selectedService) {
      return;
    }

    if (selectedService.category === "KILOAN" || selectedService.category === "EXPRESS") {
      setQuantityInput("1000");
    } else {
      setQuantityInput("1");
    }
    setItemNotes("");
  }, [selectedServiceId, selectedService?.category]);

  useEffect(() => {
    if (!filteredServices.some((service) => service.id === selectedServiceId)) {
      setSelectedServiceId(filteredServices[0]?.id ?? null);
    }
  }, [filteredServices, selectedServiceId]);

  useEffect(() => {
    if (customerQuery.trim().length < 2) {
      setCustomerResults([]);
      setSearchingCustomers(false);
      return;
    }

    const controller = new AbortController();
    const handle = window.setTimeout(async () => {
      setSearchingCustomers(true);
      try {
        const response = await fetch(`/api/stores/${slug}/customers?q=${encodeURIComponent(customerQuery.trim())}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const result = await readJsonSafe(response);

        if (!response.ok || !result?.success || !result.data) {
          throw new Error(result?.error || "Gagal mencari pelanggan");
        }

        const payload = result.data as { customers: CustomerSummary[] };
        setCustomerResults(payload.customers);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          toast.error(error instanceof Error ? error.message : "Gagal mencari pelanggan");
        }
      } finally {
        setSearchingCustomers(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(handle);
    };
  }, [customerQuery, slug]);

  const totalAmount = useMemo(() => cart.reduce((sum, item) => sum + item.subtotal, 0), [cart]);
  const paidAmount = Number(paidAmountInput || "0");
  const changeAmount = Math.max(paidAmount - totalAmount, 0);
  const remainingAmount = Math.max(totalAmount - paidAmount, 0);

  useEffect(() => {
    if (paymentType === "LUNAS") {
      setPaidAmountInput(String(totalAmount));
      return;
    }

    if (paymentType === "BELUM_BAYAR") {
      setPaidAmountInput("0");
      return;
    }

    if (totalAmount <= 1) {
      setPaidAmountInput(totalAmount > 0 ? "1" : "0");
      return;
    }

    const draft = Number(paidAmountInput || "0");
    if (draft <= 0 || draft >= totalAmount) {
      setPaidAmountInput(String(Math.max(1, Math.floor(totalAmount / 2))));
    }
  }, [paidAmountInput, paymentType, totalAmount]);

  async function handleLogout() {
    await authClient.signOut();
    router.push(`/${slug}/login`);
    router.refresh();
  }

  async function createCustomer() {
    setCreatingCustomer(true);
    try {
      const response = await fetch(`/api/stores/${slug}/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerForm),
      });
      const result = await readJsonSafe(response);

      if (!response.ok || !result?.success || !result.data) {
        throw new Error(result?.detail || result?.error || "Gagal menambah pelanggan");
      }

      const payload = result.data as { customer: CustomerSummary };
      setSelectedCustomer(payload.customer);
      setCustomerForm({ name: "", phone: "", notes: "" });
      setShowCreateCustomer(false);
      setCustomerQuery("");
      setCustomerResults([]);
      toast.success("Pelanggan baru ditambahkan");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menambah pelanggan");
    } finally {
      setCreatingCustomer(false);
    }
  }

  function addSelectedService() {
    if (!selectedService) {
      return;
    }

    const quantity = Number(quantityInput);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      toast.error("Qty atau berat harus lebih dari 0");
      return;
    }

    const unitPrice = getServiceDisplayPrice(selectedService);
    const subtotal =
      selectedService.category === "KILOAN" || selectedService.category === "EXPRESS"
        ? Math.round((unitPrice * quantity) / 1000)
        : unitPrice * quantity;

    setCart((current) => [
      ...current,
      {
        tempId: crypto.randomUUID(),
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        category: selectedService.category,
        quantity,
        unitPrice,
        subtotal,
        notes: itemNotes.trim(),
      },
    ]);
    toast.success(`${selectedService.name} ditambahkan ke pesanan`);
  }

  async function submitOrder() {
    if (cart.length === 0) {
      toast.error("Tambahkan minimal satu layanan");
      return;
    }

    if (!paymentMethodId) {
      toast.error("Pilih metode pembayaran");
      return;
    }

    setSubmittingOrder(true);
    try {
      const response = await fetch(`/api/stores/${slug}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId,
          customerId: selectedCustomer?.id ?? null,
          items: cart.map((item) => ({
            serviceId: item.serviceId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
            notes: item.notes || undefined,
          })),
          paymentType,
          paymentMethodId,
          paidAmount,
          notes: "",
        }),
      });
      const result = await readJsonSafe(response);

      if (!response.ok || !result?.success || !result.data) {
        throw new Error(result?.detail || result?.error || "Gagal membuat pesanan");
      }

      const payload = result.data as { orderNumber: string };
      toast.success("Pesanan berhasil dibuat");
      router.push(`/${slug}/orders/${payload.orderNumber}/receipt`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membuat pesanan");
    } finally {
      setSubmittingOrder(false);
    }
  }

  const selectedPaymentMethod = paymentMethods.find((method) => method.id === paymentMethodId) ?? null;

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Phase 3 POS</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">{storeName}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {branchName} · {staffName} ({staffRoleLabel})
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="tap-target">
              <Link href={`/${slug}/pos/orders`}>
                <ReceiptText className="size-4" />
                Progress Pesanan
              </Link>
            </Button>
            <Button type="button" variant="ghost" className="tap-target" onClick={handleLogout}>
              <LogOut className="size-4" />
              Keluar
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-primary" />
              <p className="text-sm font-semibold text-primary">Pelanggan</p>
            </div>
            <div className="mt-4 grid gap-3">
              <div className="flex flex-col gap-3 md:flex-row">
                <label className="flex-1">
                  <span className="mb-1 block text-sm font-medium">Cari nama atau nomor HP</span>
                  <div className="flex items-center gap-2 rounded-2xl border border-input bg-background px-3">
                    <Search className="size-4 text-muted-foreground" />
                    <input
                      className="tap-target w-full bg-transparent py-3 text-sm outline-none"
                      value={customerQuery}
                      onChange={(event) => setCustomerQuery(event.target.value)}
                      placeholder="Budi / 08xxxx"
                    />
                  </div>
                </label>
                <Button
                  type="button"
                  variant={selectedCustomer ? "outline" : "default"}
                  className="tap-target self-end"
                  onClick={() => setSelectedCustomer(null)}
                >
                  Pelanggan Umum
                </Button>
              </div>

              {searchingCustomers ? (
                <p className="text-sm text-muted-foreground">Mencari pelanggan...</p>
              ) : null}

              {customerResults.length > 0 ? (
                <div className="grid gap-2">
                  {customerResults.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      className="rounded-2xl border border-border bg-background px-4 py-3 text-left transition hover:border-primary/40 hover:bg-primary-soft/40"
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setCustomerResults([]);
                        setCustomerQuery(customer.name);
                      }}
                    >
                      <p className="text-sm font-semibold">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">{formatPhoneDisplay(customer.phone)}</p>
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">
                      {selectedCustomer ? selectedCustomer.name : "Pelanggan Umum"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedCustomer?.phone ? formatPhoneDisplay(selectedCustomer.phone) : "Tanpa data pelanggan"}
                    </p>
                  </div>
                  <Button type="button" variant="ghost" className="tap-target" onClick={() => setShowCreateCustomer((value) => !value)}>
                    <Plus className="size-4" />
                    Tambah Pelanggan
                  </Button>
                </div>

                {showCreateCustomer ? (
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <label>
                      <span className="mb-1 block text-sm font-medium">Nama pelanggan</span>
                      <input
                        className="tap-target w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none"
                        value={customerForm.name}
                        onChange={(event) => setCustomerForm((current) => ({ ...current, name: event.target.value }))}
                      />
                    </label>
                    <label>
                      <span className="mb-1 block text-sm font-medium">Nomor HP</span>
                      <input
                        className="tap-target w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none"
                        value={customerForm.phone}
                        onChange={(event) => setCustomerForm((current) => ({ ...current, phone: event.target.value }))}
                      />
                    </label>
                    <label className="md:col-span-2">
                      <span className="mb-1 block text-sm font-medium">Catatan</span>
                      <textarea
                        className="min-h-24 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none"
                        value={customerForm.notes}
                        onChange={(event) => setCustomerForm((current) => ({ ...current, notes: event.target.value }))}
                      />
                    </label>
                    <div className="md:col-span-2 flex gap-2">
                      <Button type="button" className="tap-target" disabled={creatingCustomer} onClick={createCustomer}>
                        {creatingCustomer ? "Menyimpan..." : "Simpan Pelanggan"}
                      </Button>
                      <Button type="button" variant="ghost" className="tap-target" onClick={() => setShowCreateCustomer(false)}>
                        Tutup
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm font-semibold text-primary">Layanan</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {categoryOrder.map((category) => (
                <Button
                  key={category}
                  type="button"
                  variant={activeCategory === category ? "default" : "outline"}
                  className="tap-target"
                  onClick={() => setActiveCategory(category)}
                >
                  {serviceCategoryLabels[category]}
                </Button>
              ))}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredServices.map((service) => {
                const displayPrice = getServiceDisplayPrice(service);
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => setSelectedServiceId(service.id)}
                    className={`rounded-3xl border p-4 text-left shadow-sm transition ${
                      selectedServiceId === service.id
                        ? "border-primary bg-primary-soft/60"
                        : "border-border bg-background hover:border-primary/40"
                    }`}
                  >
                    <p className="text-base font-semibold">{service.name}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{formatIDR(displayPrice)}</p>
                    {service.category === "EXPRESS" && service.priceMultiplier ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {service.baseServiceName} × {service.priceMultiplier}x
                      </p>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {selectedService ? (
              <div className="mt-5 rounded-3xl border border-border bg-muted/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{selectedService.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedService.category === "KILOAN" || selectedService.category === "EXPRESS"
                        ? "Masukkan berat dalam gram"
                        : "Masukkan jumlah item"}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-primary">{formatIDR(getServiceDisplayPrice(selectedService))}</p>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-[0.35fr_0.65fr]">
                  <label>
                    <span className="mb-1 block text-sm font-medium">
                      {selectedService.category === "KILOAN" || selectedService.category === "EXPRESS" ? "Berat (gram)" : "Qty"}
                    </span>
                    <input
                      className="tap-target w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none"
                      inputMode="numeric"
                      value={quantityInput}
                      onChange={(event) => setQuantityInput(event.target.value.replace(/\D/g, ""))}
                    />
                  </label>
                  <label>
                    <span className="mb-1 block text-sm font-medium">Catatan item</span>
                    <input
                      className="tap-target w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none"
                      value={itemNotes}
                      onChange={(event) => setItemNotes(event.target.value)}
                      placeholder="Contoh: noda berat, hanger"
                    />
                  </label>
                </div>

                <Button type="button" className="tap-target mt-4" onClick={addSelectedService}>
                  <Plus className="size-4" />
                  Tambah ke Pesanan
                </Button>
              </div>
            ) : null}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <ShoppingCart className="size-4 text-primary" />
              <p className="text-sm font-semibold text-primary">Ringkasan Pesanan</p>
            </div>
            <div className="mt-4 space-y-3">
              {cart.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
                  Belum ada layanan di pesanan ini.
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.tempId} className="rounded-2xl border border-border bg-background p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{item.serviceName}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.category === "KILOAN" || item.category === "EXPRESS"
                            ? `${(item.quantity / 1000).toFixed(1)}kg`
                            : `${item.quantity}x`}
                          {" · "}
                          {formatIDR(item.unitPrice)}
                        </p>
                        {item.notes ? <p className="mt-1 text-xs text-muted-foreground">{item.notes}</p> : null}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{formatIDR(item.subtotal)}</p>
                        <button
                          type="button"
                          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-destructive"
                          onClick={() => setCart((current) => current.filter((entry) => entry.tempId !== item.tempId))}
                        >
                          <Trash2 className="size-3.5" />
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm font-semibold text-primary">Pembayaran</p>
            <div className="mt-4 grid gap-2">
              {[
                { value: "LUNAS", label: "Lunas" },
                { value: "DP", label: "DP" },
                { value: "BELUM_BAYAR", label: "Belum Bayar" },
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3 text-sm">
                  <input
                    type="radio"
                    name="paymentType"
                    checked={paymentType === option.value}
                    onChange={() => setPaymentType(option.value as typeof paymentType)}
                  />
                  {option.label}
                </label>
              ))}
            </div>

            <label className="mt-4 block">
              <span className="mb-1 block text-sm font-medium">Metode pembayaran</span>
              <select
                className="tap-target w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none"
                value={paymentMethodId}
                onChange={(event) => setPaymentMethodId(event.target.value)}
              >
                {paymentMethods.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.name} · {method.typeLabel}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-4 block">
              <span className="mb-1 block text-sm font-medium">Nominal dibayar</span>
              <input
                className="tap-target w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none"
                inputMode="numeric"
                value={paidAmountInput}
                onChange={(event) => setPaidAmountInput(event.target.value.replace(/\D/g, ""))}
              />
            </label>

            {selectedPaymentMethod?.type === "QRIS" && qrisImageUrl ? (
              <div className="mt-4 rounded-2xl border border-border bg-muted/20 p-4">
                <p className="text-sm font-semibold">Preview QRIS</p>
                <img src={qrisImageUrl} alt="QRIS toko" className="mt-3 max-h-56 rounded-2xl border border-border object-contain" />
              </div>
            ) : null}

            <div className="mt-5 rounded-2xl border border-border bg-muted/20 p-4 text-sm">
              <div className="flex justify-between">
                <span>Total</span>
                <span className="font-semibold">{formatIDR(totalAmount)}</span>
              </div>
              <div className="mt-2 flex justify-between">
                <span>Dibayar</span>
                <span>{formatIDR(paidAmount)}</span>
              </div>
              <div className="mt-2 flex justify-between">
                <span>{paymentType === "LUNAS" ? "Kembalian" : "Sisa"}</span>
                <span>{formatIDR(paymentType === "LUNAS" ? changeAmount : remainingAmount)}</span>
              </div>
            </div>

            <Button type="button" className="tap-target mt-5 w-full" disabled={submittingOrder} onClick={submitOrder}>
              {submittingOrder ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Menyimpan Pesanan...
                </>
              ) : (
                <>
                  <ReceiptText className="size-4" />
                  Buat Pesanan
                </>
              )}
            </Button>
          </div>
        </aside>
      </section>
    </main>
  );
}
