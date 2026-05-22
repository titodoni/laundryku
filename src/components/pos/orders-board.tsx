"use client";

import { Button } from "@/components/ui/button";
import type { PaymentMethodSummary } from "@/lib/payment-methods";
import type { OrderSummary } from "@/lib/pos";
import { formatPhoneDisplay } from "@/lib/phone";
import { Loader2, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type OrdersBoardProps = {
  slug: string;
  branchName: string;
  paymentMethods: PaymentMethodSummary[];
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

const filterOptions = [
  { value: "ALL", label: "Semua" },
  { value: "RECEIVED", label: "Diterima" },
  { value: "WASHING", label: "Cuci" },
  { value: "DRYING", label: "Kering" },
  { value: "IRONING", label: "Setrika" },
  { value: "PACKING", label: "Packing" },
  { value: "READY", label: "Siap" },
  { value: "PICKED_UP", label: "Diambil" },
  { value: "DELIVERED", label: "Diantar" },
  { value: "CANCELLED", label: "Batal" },
] as const;

const nextStatusMap: Record<string, string[]> = {
  RECEIVED: ["WASHING"],
  WASHING: ["DRYING"],
  DRYING: ["IRONING"],
  IRONING: ["PACKING"],
  PACKING: ["READY"],
  READY: ["PICKED_UP", "DELIVERED"],
  PICKED_UP: [],
  DELIVERED: [],
  CANCELLED: [],
};

export function OrdersBoard({ slug, branchName, paymentMethods }: OrdersBoardProps) {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [settleMethodByOrder, setSettleMethodByOrder] = useState<Record<string, string>>({});

  async function loadOrders() {
    setLoading(true);
    try {
      const response = await fetch(`/api/stores/${slug}/orders?today=1&status=${statusFilter}`, {
        cache: "no-store",
      });
      const result = await readJsonSafe(response);
      if (!response.ok || !result?.success || !result.data) {
        throw new Error(result?.error || "Gagal memuat daftar pesanan");
      }

      const payload = result.data as { orders: OrderSummary[] };
      setOrders(payload.orders);
      setSettleMethodByOrder((current) => {
        const next = { ...current };
        for (const order of payload.orders) {
          if (!next[order.id] && paymentMethods[0]?.id) {
            next[order.id] = paymentMethods[0].id;
          }
        }
        return next;
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memuat daftar pesanan");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOrders();
  }, [statusFilter]);

  const visibleOrders = useMemo(() => {
    if (statusFilter === "CANCELLED") {
      return orders.filter((order) => order.status === "CANCELLED");
    }

    if (statusFilter === "ALL") {
      return orders.filter((order) => order.status !== "CANCELLED");
    }

    return orders;
  }, [orders, statusFilter]);

  async function updateStatus(orderId: string, newStatus: string) {
    setProcessingId(orderId);
    try {
      const response = await fetch(`/api/stores/${slug}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newStatus }),
      });
      const result = await readJsonSafe(response);
      if (!response.ok || !result?.success) {
        throw new Error(result?.error || "Gagal memperbarui status");
      }
      toast.success("Status pesanan diperbarui");
      await loadOrders();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memperbarui status");
    } finally {
      setProcessingId(null);
    }
  }

  async function settleOrder(order: OrderSummary) {
    const paymentMethodId = settleMethodByOrder[order.id] ?? paymentMethods[0]?.id ?? "";
    if (!paymentMethodId) {
      toast.error("Metode pembayaran tidak tersedia");
      return;
    }

    setProcessingId(order.id);
    try {
      const response = await fetch(`/api/stores/${slug}/orders/${order.id}/settle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: order.remainingAmount,
          paymentMethodId,
        }),
      });
      const result = await readJsonSafe(response);
      if (!response.ok || !result?.success) {
        throw new Error(result?.error || "Gagal melunasi DP");
      }
      toast.success("DP berhasil dilunasi");
      await loadOrders();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal melunasi DP");
    } finally {
      setProcessingId(null);
    }
  }

  async function cancelOrder(order: OrderSummary) {
    const reason = window.prompt(`Alasan pembatalan untuk ${order.orderNumber}:`, "Pelanggan membatalkan");
    if (!reason || !reason.trim()) {
      return;
    }

    setProcessingId(order.id);
    try {
      const response = await fetch(`/api/stores/${slug}/orders/${order.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const result = await readJsonSafe(response);
      if (!response.ok || !result?.success) {
        throw new Error(result?.error || "Gagal membatalkan pesanan");
      }
      toast.success("Pesanan dibatalkan");
      await loadOrders();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membatalkan pesanan");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Progress Phase 3</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">Pesanan Hari Ini</h1>
            <p className="mt-1 text-sm text-muted-foreground">{branchName} · semua staff aktif bisa update progress</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="tap-target">
              <Link href={`/${slug}/pos`}>Kembali ke POS</Link>
            </Button>
            <Button type="button" variant="ghost" className="tap-target" onClick={() => void loadOrders()}>
              <RefreshCcw className={`size-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={statusFilter === option.value ? "default" : "outline"}
              className="tap-target"
              onClick={() => setStatusFilter(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-3xl border border-border bg-card p-10 text-center text-sm text-muted-foreground shadow-sm">
            Memuat pesanan...
          </div>
        ) : visibleOrders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground shadow-sm">
            Belum ada pesanan untuk filter ini.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {visibleOrders.map((order) => {
              const nextStatuses = nextStatusMap[order.status] ?? [];
              const cancellable = !["PICKED_UP", "DELIVERED", "CANCELLED"].includes(order.status);
              const pending = processingId === order.id;
              return (
                <article key={order.id} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-primary">{order.orderNumber}</p>
                      <h2 className="mt-1 text-lg font-semibold">{order.customerName}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {order.customerPhone ? formatPhoneDisplay(order.customerPhone) : "Pelanggan Umum"}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-semibold">{order.statusLabel}</p>
                      <p className="text-muted-foreground">{order.paymentStatusLabel}</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-border bg-muted/20 p-4 text-sm">
                    <p className="font-medium">{order.itemSummary}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-muted-foreground">
                      <span>Total</span>
                      <span className="text-right font-medium text-foreground">{order.totalAmountLabel}</span>
                      <span>Dibayar</span>
                      <span className="text-right">{order.paidAmountLabel}</span>
                      <span>Sisa</span>
                      <span className="text-right">{order.remainingAmountLabel}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button asChild type="button" variant="outline" className="tap-target">
                      <Link href={`/${slug}/orders/${order.orderNumber}/receipt`} target="_blank">
                        Struk
                      </Link>
                    </Button>
                    <Button asChild type="button" variant="outline" className="tap-target">
                      <Link href={`/${slug}/orders/${order.orderNumber}/label`} target="_blank">
                        Label
                      </Link>
                    </Button>
                    {nextStatuses.map((status) => (
                      <Button
                        key={status}
                        type="button"
                        className="tap-target"
                        disabled={pending}
                        onClick={() => void updateStatus(order.id, status)}
                      >
                        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
                        {filterOptions.find((item) => item.value === status)?.label ?? status}
                      </Button>
                    ))}
                  </div>

                  {order.paymentStatus === "PARTIAL" ? (
                    <div className="mt-4 rounded-2xl border border-border bg-background p-4">
                      <p className="text-sm font-semibold">Pelunasan DP</p>
                      <div className="mt-3 flex flex-col gap-3 md:flex-row">
                        <select
                          className="tap-target flex-1 rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none"
                          value={settleMethodByOrder[order.id] ?? paymentMethods[0]?.id ?? ""}
                          onChange={(event) =>
                            setSettleMethodByOrder((current) => ({
                              ...current,
                              [order.id]: event.target.value,
                            }))
                          }
                        >
                          {paymentMethods.map((method) => (
                            <option key={method.id} value={method.id}>
                              {method.name} · {method.typeLabel}
                            </option>
                          ))}
                        </select>
                        <Button type="button" className="tap-target" disabled={pending} onClick={() => void settleOrder(order)}>
                          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
                          Lunasi {order.remainingAmountLabel}
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  {cancellable ? (
                    <div className="mt-4">
                      <Button type="button" variant="destructive" className="tap-target" disabled={pending} onClick={() => void cancelOrder(order)}>
                        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
                        Batalkan Pesanan
                      </Button>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
