"use client";

import { Button } from "@/components/ui/button";
import {
  formatOrderStatusDebugLabel,
  isNonCancellableOrderStatus,
  type OrderLifecycleStatus,
} from "@/lib/order-status";
import type { PaymentMethodSummary } from "@/lib/payment-methods";
import type { OrderSummary } from "@/lib/pos";
import { formatPhoneDisplay } from "@/lib/phone";
import { Loader2, Plus, RefreshCcw, Search } from "lucide-react";
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
  { value: "RECEIVED", label: "Baru" },
  { value: "PROCESS", label: "Diproses" },
  { value: "READY", label: "Siap Diambil" },
  { value: "HANDOFF", label: "Diambil" },
  { value: "CLOSED", label: "Ditutup" },
  { value: "UNPAID", label: "Belum Dibayar" },
  { value: "CANCELLED", label: "Batal" },
] as const;

const nextStatusMap: Record<OrderLifecycleStatus, OrderLifecycleStatus[]> = {
  RECEIVED: ["PROCESS"],
  PROCESS: ["READY"],
  READY: ["PICKED_UP", "DELIVERED"],
  PICKED_UP: ["CLOSED"],
  DELIVERED: ["CLOSED"],
  CLOSED: [],
  CANCELLED: [],
};

const actionLabels: Record<OrderLifecycleStatus, string> = {
  RECEIVED: "Baru",
  PROCESS: "Mulai Proses",
  READY: "Tandai Siap Diambil",
  PICKED_UP: "Ambil Pesanan",
  DELIVERED: "Antar Pesanan",
  CLOSED: "Tutup Pesanan",
  CANCELLED: "Dibatalkan",
};

function isSameDay(left: Date, right: Date) {
  return (
    left.getDate() === right.getDate() &&
    left.getMonth() === right.getMonth() &&
    left.getFullYear() === right.getFullYear()
  );
}

function getUrgencyBadges(order: OrderSummary) {
  const badges: Array<{ label: string; className: string }> = [];
  const estimatedReadyAt = order.estimatedReadyAt ? new Date(order.estimatedReadyAt) : null;
  const now = new Date();

  if (estimatedReadyAt && (order.status === "RECEIVED" || order.status === "PROCESS")) {
    if (estimatedReadyAt.getTime() < now.getTime()) {
      badges.push({ label: "late", className: "border-destructive/30 bg-destructive/10 text-destructive" });
    } else if (isSameDay(estimatedReadyAt, now)) {
      badges.push({ label: "today", className: "border-warning/30 bg-warning/10 text-warning" });
    }
  }

  if (order.status === "READY") {
    badges.push({ label: "pickup pending", className: "border-primary/20 bg-primary/10 text-primary" });
  }

  if (order.paymentStatus !== "PAID") {
    badges.push({ label: "unpaid", className: "border-warning/30 bg-warning/10 text-warning" });
  }

  return badges;
}

export function OrdersBoard({ slug, branchName, paymentMethods }: OrdersBoardProps) {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [settleMethodByOrder, setSettleMethodByOrder] = useState<Record<string, string>>({});

  async function loadOrders() {
    setLoading(true);
    try {
      const response = await fetch(`/api/stores/${slug}/orders?today=1&status=ALL`, {
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
  }, []);

  const visibleOrders = useMemo(() => {
    const byStatus = (() => {
      switch (statusFilter) {
        case "RECEIVED":
          return orders.filter((order) => order.status === "RECEIVED");
        case "PROCESS":
          return orders.filter((order) => order.status === "PROCESS");
        case "READY":
          return orders.filter((order) => order.status === "READY");
        case "HANDOFF":
          return orders.filter((order) => order.status === "PICKED_UP" || order.status === "DELIVERED");
        case "CLOSED":
          return orders.filter((order) => order.status === "CLOSED");
        case "UNPAID":
          return orders.filter((order) => order.paymentStatus !== "PAID" && order.status !== "CANCELLED");
        case "CANCELLED":
          return orders.filter((order) => order.status === "CANCELLED");
        case "ALL":
        default:
          return orders.filter((order) => order.status !== "CANCELLED");
      }
    })();

    const needle = query.trim().toLowerCase();
    if (!needle) {
      return byStatus;
    }

    return byStatus.filter((order) =>
      [order.orderNumber, order.customerName, order.customerPhone ?? ""].some((value) =>
        value.toLowerCase().includes(needle),
      ),
    );
  }, [orders, query, statusFilter]);

  const activeOrdersCount = useMemo(
    () => orders.filter((order) => order.status !== "CLOSED" && order.status !== "CANCELLED").length,
    [orders],
  );

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
      toast.success(`Status pesanan menjadi ${actionLabels[newStatus as OrderLifecycleStatus] ?? newStatus}`);
      await loadOrders();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memperbarui status");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleStatusAction(order: OrderSummary, nextStatus: OrderLifecycleStatus) {
    if (
      nextStatus === "PICKED_UP" &&
      !window.confirm(`Tandai ${order.orderNumber} sudah diambil pelanggan?`)
    ) {
      return;
    }

    if (
      nextStatus === "DELIVERED" &&
      !window.confirm(`Tandai ${order.orderNumber} sudah diantar ke pelanggan?`)
    ) {
      return;
    }

    if (
      nextStatus === "CLOSED" &&
      !window.confirm(`Tutup pesanan ${order.orderNumber}? Status ini untuk penutupan administrasi akhir.`)
    ) {
      return;
    }

    await updateStatus(order.id, nextStatus);
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
      <header className="border-b bg-card">
        <div className="container flex min-h-14 flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Pesanan Hari Ini</h1>
            <p className="mt-1 text-sm text-muted-foreground">{branchName} · {activeOrdersCount} pesanan aktif</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="h-11 bg-gradient-primary shadow-glow">
              <Link href={`/${slug}/pos`}>
                <Plus className="h-4 w-4" />
                Baru
              </Link>
            </Button>
            <Button type="button" variant="ghost" className="h-11" onClick={() => void loadOrders()}>
              <RefreshCcw className={`size-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <section className="container max-w-3xl space-y-3 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari nomor pesanan atau pelanggan..."
            className="h-11 w-full rounded-md border bg-card pl-9 pr-3 text-sm"
          />
        </div>

        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                statusFilter === option.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground"
              }`}
              onClick={() => setStatusFilter(option.value)}
            >
              {option.label}
            </button>
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
          <div className="space-y-2">
            {visibleOrders.map((order) => {
              const orderCode = order.orderNumber;
              const nextStatuses = nextStatusMap[order.status] ?? [];
              const cancellable = !isNonCancellableOrderStatus(order.status);
              const pending = processingId === order.id;
              const estimatedReadyAt = order.estimatedReadyAt
                ? new Date(order.estimatedReadyAt).toLocaleString("id-ID", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Belum dihitung";
              const urgencyBadges = getUrgencyBadges(order);
              return (
                <article key={order.id} className="rounded-xl border bg-card p-3 shadow-soft">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-primary">{order.orderNumber}</p>
                      <h2 className="mt-1 text-lg font-semibold">{order.customerName}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {order.customerPhone ? formatPhoneDisplay(order.customerPhone) : "Pelanggan Umum"}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-semibold">{formatOrderStatusDebugLabel(order.status)}</p>
                      <p className="text-muted-foreground">{order.paymentStatusLabel} ({order.paymentStatus})</p>
                    </div>
                  </div>

                  {urgencyBadges.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {urgencyBadges.map((badge) => (
                        <span
                          key={badge.label}
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-4 rounded-2xl border border-border bg-muted/20 p-4 text-sm">
                    <p className="font-medium">{order.itemSummary}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-muted-foreground">
                      <span>Estimasi siap</span>
                      <span className="text-right">{estimatedReadyAt}</span>
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
                      <Link href={`/${slug}/orders/${orderCode}/receipt`} target="_blank">
                        Struk
                      </Link>
                    </Button>
                    <Button asChild type="button" variant="outline" className="tap-target">
                      <Link href={`/${slug}/orders/${orderCode}/label`} target="_blank">
                        Label
                      </Link>
                    </Button>
                    {nextStatuses.map((status) => (
                      <Button
                        key={status}
                        type="button"
                        variant={status === "DELIVERED" ? "outline" : status === "CLOSED" ? "secondary" : "default"}
                        className="tap-target"
                        disabled={pending}
                        onClick={() => void handleStatusAction(order, status)}
                      >
                        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
                        {actionLabels[status]}
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
