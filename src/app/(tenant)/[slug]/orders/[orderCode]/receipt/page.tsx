import { ReceiptActions } from "@/components/pos/print-actions";
import { db } from "@/lib/db";
import { formatOrderStatusDebugLabel } from "@/lib/order-status";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";

const paymentStatusLabels: Record<string, string> = {
  UNPAID: "Belum Bayar",
  PARTIAL: "DP",
  PAID: "Lunas",
  REFUNDED: "Refund",
};

/**
 * Order receipt page — resource-centric URL (not nested under /pos/).
 * Accessible from POS, dashboard, or direct link.
 *
 * URL: /{slug}/orders/{orderCode}/receipt
 */
export default async function ReceiptPage({
  params,
}: {
  params: { slug: string; orderCode: string };
}) {
  const { slug, orderCode } = params;

  const store = await db.store.findUnique({
    where: { slug },
    include: { branches: true },
  });

  if (!store) notFound();

  const order = await db.order.findFirst({
    where: {
      storeId: store.id,
      orderNumber: orderCode,
      deletedAt: null,
    },
    include: {
      items: { include: { service: true } },
      payments: { include: { paymentMethod: true } },
      customer: true,
      branch: true,
    },
  });

  if (!order) notFound();

  const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${slug}/orders/${orderCode}/track`;

  return (
    <main className="min-h-screen bg-background print:bg-white">
      <header className="border-b bg-card print:hidden">
        <div className="container flex min-h-14 items-center justify-between py-4">
          <div>
            <h1 className="font-display text-xl font-bold">Struk Pesanan</h1>
            <p className="font-mono text-sm text-muted-foreground">{order.orderNumber}</p>
          </div>
          <Link href={`/${slug}/pos/orders`} className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke daftar
          </Link>
        </div>
      </header>

      <div className="container max-w-md space-y-3 py-4 print:p-0">
        <div className="receipt-paper mx-auto rounded-xl border p-4 font-mono text-sm shadow-soft print:border-0 print:shadow-none">
      <div className="mb-4 text-center">
        {store.logoUrl && (
          <img
            src={store.logoUrl}
            alt={store.name}
            className="mx-auto mb-2 h-16 w-16 object-contain"
          />
        )}
        <h1 className="text-lg font-bold">{store.name}</h1>
        <p className="text-xs text-gray-500">{store.address}</p>
        <p className="text-xs text-gray-500">{store.phone}</p>
      </div>

      {/* Order Number */}
      <div className="mb-4 border-b border-t border-gray-300 py-2 text-center">
        <span className="text-lg font-bold text-teal-600">
          {order.orderNumber}
        </span>
      </div>

      {/* Customer */}
      <div className="mb-4">
        <p className="font-semibold">{order.customer?.name ?? "Pelanggan Umum"}</p>
        {order.customer?.phone ? <p className="text-xs text-gray-500">{order.customer.phone}</p> : null}
      </div>

      {/* Items */}
      <table className="mb-4 w-full text-left">
        <thead>
          <tr className="border-b">
            <th className="py-1">Item</th>
            <th className="py-1 text-right">Qty</th>
            <th className="py-1 text-right">Harga</th>
            <th className="py-1 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id}>
              <td className="py-1">{item.service.name}</td>
              <td className="py-1 text-right">
                {item.service.category === "KILOAN" || item.service.category === "EXPRESS"
                  ? `${(item.quantity / 1000).toFixed(1)}kg`
                  : item.quantity}
              </td>
              <td className="py-1 text-right">
                Rp {item.unitPrice.toLocaleString("id-ID")}
              </td>
              <td className="py-1 text-right">
                Rp {item.subtotal.toLocaleString("id-ID")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="mb-4 border-t border-gray-300 pt-2">
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>Rp {order.totalAmount.toLocaleString("id-ID")}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Dibayar</span>
          <span>Rp {order.paidAmount.toLocaleString("id-ID")}</span>
        </div>
        {order.remainingAmount > 0 && (
          <div className="flex justify-between text-sm text-red-600">
            <span>Sisa</span>
            <span>Rp {order.remainingAmount.toLocaleString("id-ID")}</span>
          </div>
        )}
      </div>

      <div className="mb-4 rounded-md bg-slate-50 p-3 text-xs">
        <p>
          Status Pesanan:{" "}
          <span className="font-semibold">
            {formatOrderStatusDebugLabel(order.status)}
          </span>
        </p>
        <p className="mt-1">
          Status Pembayaran:{" "}
          <span className="font-semibold">
            {paymentStatusLabels[order.paymentStatus] ?? order.paymentStatus} ({order.paymentStatus})
          </span>
        </p>
      </div>

      {/* Payment Info */}
      {order.payments.length > 0 && (
        <div className="mb-4 text-xs text-gray-500">
          <p>
            Metode:{" "}
            {order.payments.at(-1)?.paymentMethod?.name ?? "N/A"}
          </p>
          <p>
            Tanggal:{" "}
            {new Date(order.createdAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      )}

      {/* QR Code for Tracking */}
      <div className="mb-4 flex justify-center">
          <QRCodeSVG value={trackingUrl} size={128} />
      </div>
      <p className="mb-4 text-center text-xs text-gray-500">
        Scan untuk lacak pesanan
      </p>

        </div>
        <ReceiptActions slug={slug} orderCode={orderCode} />
      </div>
    </main>
  );
}
