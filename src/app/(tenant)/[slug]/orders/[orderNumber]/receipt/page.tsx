import { ReceiptActions } from "@/components/pos/print-actions";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";

/**
 * Order receipt page — resource-centric URL (not nested under /pos/).
 * Accessible from POS, dashboard, or direct link.
 *
 * URL: /{slug}/orders/{orderNumber}/receipt
 */
export default async function ReceiptPage({
  params,
}: {
  params: { slug: string; orderNumber: string };
}) {
  const { slug, orderNumber } = params;

  const store = await db.store.findUnique({
    where: { slug },
    include: { branches: true },
  });

  if (!store) notFound();

  const order = await db.order.findFirst({
    where: {
      storeId: store.id,
      orderNumber,
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

  const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${slug}/orders/${orderNumber}/track`;

  return (
    <div className="receipt-paper mx-auto max-w-sm p-4 font-mono text-sm">
      {/* Header */}
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

      {/* Actions */}
      <ReceiptActions slug={slug} orderNumber={orderNumber} />
    </div>
  );
}
