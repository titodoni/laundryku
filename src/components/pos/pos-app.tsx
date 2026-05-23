"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import type { PaymentMethodSummary } from "@/lib/payment-methods";
import type { CustomerSummary } from "@/lib/pos";
import { formatPhoneDisplay } from "@/lib/phone";
import { formatIDR, getServiceDisplayPrice, serviceCategoryLabels, type ServiceSummary } from "@/lib/services";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Loader2,
  LogOut,
  Minus,
  Plus,
  ReceiptText,
  Search,
  ShoppingCart,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
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

const stepsMeta = [
  { icon: User, label: "Pelanggan" },
  { icon: Sparkles, label: "Layanan" },
  { icon: CreditCard, label: "Bayar" },
];

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
  const [step, setStep] = useState(0);
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerResults, setCustomerResults] = useState<CustomerSummary[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);
  const [searchingCustomers, setSearchingCustomers] = useState(false);
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const [customerForm, setCustomerForm] = useState<CreateCustomerForm>({ name: "", phone: "", notes: "" });
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(services[0]?.id ?? null);
  const [quantityInput, setQuantityInput] = useState("1000");
  const [itemNotes, setItemNotes] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentType, setPaymentType] = useState<"LUNAS" | "DP" | "BELUM_BAYAR">("LUNAS");
  const [paymentMethodId, setPaymentMethodId] = useState(paymentMethods[0]?.id ?? "");
  const [paidAmountInput, setPaidAmountInput] = useState("0");
  const [submittingOrder, setSubmittingOrder] = useState(false);

  const selectedService = useMemo(
    () => services.find((service) => service.id === selectedServiceId) ?? services[0] ?? null,
    [selectedServiceId, services],
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
      const orderCode = payload.orderNumber;
      toast.success("Pesanan berhasil dibuat");
      router.push(`/${slug}/orders/${orderCode}/receipt`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membuat pesanan");
    } finally {
      setSubmittingOrder(false);
    }
  }

  const selectedPaymentMethod = paymentMethods.find((method) => method.id === paymentMethodId) ?? null;
  const canNext = step === 0 ? true : step === 1 ? cart.length > 0 : paymentMethodId.length > 0;
  const selectedQuantity = Number(quantityInput || "0");
  const selectedIsWeight = selectedService?.category === "KILOAN" || selectedService?.category === "EXPRESS";
  const quantityStep = selectedIsWeight ? 500 : 1;
  const quickQuantities = selectedIsWeight
    ? [
        { label: "0.5 kg", value: 500 },
        { label: "1 kg", value: 1000 },
        { label: "2 kg", value: 2000 },
        { label: "3 kg", value: 3000 },
        { label: "5 kg", value: 5000 },
      ]
    : [
        { label: "1 pcs", value: 1 },
        { label: "2 pcs", value: 2 },
        { label: "3 pcs", value: 3 },
        { label: "5 pcs", value: 5 },
        { label: "10 pcs", value: 10 },
      ];

  function setSteppedQuantity(next: number) {
    const minimum = selectedIsWeight ? 500 : 1;
    setQuantityInput(String(Math.max(minimum, next)));
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container flex min-h-14 items-center justify-between py-4">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Buat Pesanan</h1>
            <p className="mt-1 text-sm text-muted-foreground">Langkah {step + 1} dari 3 · {branchName}</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="h-11">
              <Link href={`/${slug}/pos/orders`}>
                <ReceiptText className="size-4" />
                <span className="hidden sm:inline">Pesanan</span>
              </Link>
            </Button>
            <Button type="button" variant="ghost" className="h-11" onClick={handleLogout}>
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Keluar</span>
            </Button>
          </div>
        </div>
      </header>

      <section className="container max-w-2xl space-y-4 py-4">
        <ol className="flex items-center gap-1">
          {stepsMeta.map((item, index) => (
            <li key={item.label} className="flex flex-1 items-center gap-2">
              <div
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-full border-2",
                  index < step
                    ? "border-primary bg-primary text-primary-foreground"
                    : index === step
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-border bg-card text-muted-foreground",
                )}
                title={item.label}
              >
                {index < step ? <CheckCircle2 className="h-4 w-4" /> : <item.icon className="h-4 w-4" />}
              </div>
              {index < stepsMeta.length - 1 ? (
                <div className={cn("h-0.5 flex-1", index < step ? "bg-primary" : "bg-border")} />
              ) : null}
            </li>
          ))}
        </ol>

        {step === 0 ? (
          <div className="space-y-3">
            <p className="font-display font-semibold">Pilih Pelanggan</p>
            <div className="rounded-xl border bg-card p-3 shadow-soft">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  className="h-11 w-full rounded-md border bg-background pl-9 pr-3 text-sm"
                  value={customerQuery}
                  onChange={(event) => setCustomerQuery(event.target.value)}
                  placeholder="Cari nama atau nomor HP..."
                />
              </div>

              {searchingCustomers ? <p className="mt-3 text-sm text-muted-foreground">Mencari pelanggan...</p> : null}

              {customerResults.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {customerResults.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      className="w-full rounded-xl border bg-background p-3 text-left transition hover:border-primary"
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setCustomerResults([]);
                        setCustomerQuery(customer.name);
                      }}
                    >
                      <p className="font-semibold">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">{formatPhoneDisplay(customer.phone)}</p>
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border bg-muted/30 p-3">
                <div>
                  <p className="text-sm font-semibold">{selectedCustomer?.name ?? "Pelanggan Umum"}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedCustomer?.phone ? formatPhoneDisplay(selectedCustomer.phone) : "Tanpa data pelanggan"}
                  </p>
                </div>
                <Button type="button" variant={selectedCustomer ? "outline" : "default"} onClick={() => setSelectedCustomer(null)}>
                  Umum
                </Button>
              </div>
            </div>

            <button
              type="button"
              className="text-sm font-semibold text-primary"
              onClick={() => setShowCreateCustomer((value) => !value)}
            >
              {showCreateCustomer ? "Tutup tambah pelanggan" : "+ Tambah pelanggan baru"}
            </button>

            {showCreateCustomer ? (
              <div className="rounded-xl border bg-card p-3 shadow-soft">
                <div className="grid gap-3">
                  <input
                    className="h-11 rounded-md border bg-background px-3 text-sm"
                    value={customerForm.name}
                    onChange={(event) => setCustomerForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Nama pelanggan"
                  />
                  <input
                    className="h-11 rounded-md border bg-background px-3 text-sm"
                    value={customerForm.phone}
                    onChange={(event) => setCustomerForm((current) => ({ ...current, phone: event.target.value }))}
                    placeholder="Nomor HP"
                  />
                  <textarea
                    className="min-h-20 rounded-md border bg-background px-3 py-2 text-sm"
                    value={customerForm.notes}
                    onChange={(event) => setCustomerForm((current) => ({ ...current, notes: event.target.value }))}
                    placeholder="Catatan"
                  />
                  <Button type="button" disabled={creatingCustomer} onClick={createCustomer}>
                    {creatingCustomer ? "Menyimpan..." : "Simpan Pelanggan"}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-3">
            <p className="font-display font-semibold">Pilih Layanan</p>

            <div className="grid grid-cols-2 gap-2">
              {services.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setSelectedServiceId(service.id)}
                  className={cn(
                    "rounded-xl border bg-card p-3 text-left shadow-soft transition",
                    selectedServiceId === service.id ? "border-primary bg-primary-soft" : "border-border",
                  )}
                >
                  <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-semibold text-primary">
                    {serviceCategoryLabels[service.category]}
                  </span>
                  <p className="mt-2 text-sm font-semibold leading-tight">{service.name}</p>
                  <p className="mt-1 text-xs font-semibold text-primary">{formatIDR(getServiceDisplayPrice(service))}</p>
                </button>
              ))}
            </div>

            {selectedService ? (
              <div className="rounded-xl border bg-card p-3 shadow-soft">
                <p className="text-sm font-semibold">{selectedService.name}</p>
                <div className="mt-3 grid grid-cols-5 gap-1.5">
                  {quickQuantities.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={cn(
                        "h-10 rounded-lg border px-1 text-xs font-semibold",
                        selectedQuantity === option.value
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground",
                      )}
                      onClick={() => setQuantityInput(String(option.value))}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-[3rem_1fr_3rem] items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12"
                    onClick={() => setSteppedQuantity(selectedQuantity - quantityStep)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="rounded-xl border bg-muted/30 px-3 py-2 text-center">
                    <p className="font-display text-2xl font-bold">
                      {selectedIsWeight ? (selectedQuantity / 1000).toFixed(selectedQuantity % 1000 === 0 ? 0 : 1) : selectedQuantity}
                    </p>
                    <p className="text-xs font-semibold text-muted-foreground">{selectedIsWeight ? "kg" : "pcs"}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12"
                    onClick={() => setSteppedQuantity(selectedQuantity + quantityStep)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <input
                  className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={itemNotes}
                  onChange={(event) => setItemNotes(event.target.value)}
                  placeholder="Catatan item"
                />
                <Button type="button" className="mt-3 h-11 w-full bg-gradient-primary" onClick={addSelectedService}>
                  <Plus className="h-4 w-4" />
                  Tambah ke Pesanan
                </Button>
              </div>
            ) : null}

            <div className="rounded-xl border bg-card p-3 shadow-soft">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">Ringkasan Pesanan</p>
              </div>
              <div className="mt-3 space-y-2">
                {cart.length === 0 ? (
                  <div className="rounded-xl border border-dashed bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
                    Belum ada layanan.
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.tempId} className="flex items-start justify-between gap-3 rounded-xl border bg-background p-3">
                      <div>
                        <p className="text-sm font-semibold">{item.serviceName}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.category === "KILOAN" || item.category === "EXPRESS"
                            ? `${(item.quantity / 1000).toFixed(1)}kg`
                            : `${item.quantity}x`}
                          {" · "}
                          {formatIDR(item.unitPrice)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{formatIDR(item.subtotal)}</p>
                        <button
                          type="button"
                          className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-destructive"
                          onClick={() => setCart((current) => current.filter((entry) => entry.tempId !== item.tempId))}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-3">
            <p className="font-display font-semibold">Pembayaran</p>
            <div className="rounded-xl border bg-card p-3 shadow-soft">
              <div className="grid gap-2">
                {[
                  { value: "LUNAS", label: "Lunas", description: "Bayar penuh sekarang" },
                  { value: "DP", label: "DP", description: "Bayar sebagian dulu" },
                  { value: "BELUM_BAYAR", label: "Belum Bayar", description: "Bayar saat pengambilan" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={cn(
                      "rounded-xl border p-3 text-left",
                      paymentType === option.value ? "border-primary bg-primary-soft text-primary" : "border-border",
                    )}
                    onClick={() => setPaymentType(option.value as typeof paymentType)}
                  >
                    <span className="block text-sm font-semibold">{option.label}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{option.description}</span>
                  </button>
                ))}
              </div>

              <div className="mt-4">
                <p className="mb-2 text-sm font-medium">Metode pembayaran</p>
                <div className="grid grid-cols-2 gap-2">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      className={cn(
                        "rounded-xl border p-3 text-left",
                        paymentMethodId === method.id ? "border-primary bg-primary-soft text-primary" : "border-border",
                      )}
                      onClick={() => setPaymentMethodId(method.id)}
                    >
                      <span className="block text-sm font-semibold">{method.name}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{method.typeLabel}</span>
                    </button>
                  ))}
                </div>
              </div>

              <label className="mt-4 block">
                <span className="mb-1 block text-sm font-medium">Nominal dibayar</span>
                <input
                  className="h-11 w-full rounded-md border bg-background px-3 text-sm"
                  inputMode="numeric"
                  value={paidAmountInput}
                  onChange={(event) => setPaidAmountInput(event.target.value.replace(/\D/g, ""))}
                />
              </label>

              {selectedPaymentMethod?.type === "QRIS" && qrisImageUrl ? (
                <div className="mt-4 rounded-xl border bg-muted/20 p-3">
                  <p className="text-sm font-semibold">Preview QRIS</p>
                  <img src={qrisImageUrl} alt="QRIS toko" className="mt-3 max-h-56 rounded-xl border object-contain" />
                </div>
              ) : null}

              <div className="mt-5 rounded-xl border bg-muted/20 p-4 text-sm">
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

              <Button type="button" className="mt-5 h-12 w-full bg-gradient-primary shadow-glow" disabled={submittingOrder} onClick={submitOrder}>
                {submittingOrder ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Menyimpan Pesanan...
                  </>
                ) : (
                  <>
                    <ReceiptText className="h-4 w-4" />
                    Buat Pesanan
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : null}

        {step < 2 ? (
          <div className="sticky bottom-4 flex gap-2 pt-2">
            {step > 0 ? (
              <Button type="button" variant="outline" className="h-12" onClick={() => setStep((current) => current - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            ) : null}
            <Button
              type="button"
              disabled={!canNext}
              onClick={() => setStep((current) => current + 1)}
              className="h-12 flex-1 bg-gradient-primary font-semibold shadow-glow"
            >
              {step === 1 ? `Bayar ${formatIDR(totalAmount)}` : "Lanjut"}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button type="button" variant="ghost" className="w-full" onClick={() => setStep(1)}>
            <ChevronLeft className="h-4 w-4" />
            Kembali ke layanan
          </Button>
        )}
      </section>
    </main>
  );
}
