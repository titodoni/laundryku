import { LabelActions } from "@/components/pos/print-actions";
import { MarkLabelPrinted } from "@/components/pos/mark-label-printed";
import { db } from "@/lib/db";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";

/**
 * Packaging label page — resource-centric URL (not nested under /pos/).
 * Accessible from POS, dashboard, or direct link.
 *
 * URL: /{slug}/orders/{orderCode}/label
 * Print format: 80mm thermal label paper
 */
export default async function LabelPage({
  params,
}: {
  params: { slug: string; orderCode: string };
}) {
  const { slug, orderCode } = params;

  const store = await db.store.findUnique({
    where: { slug },
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
      customer: true,
      branch: true,
    },
  });

  if (!order) notFound();

  const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${slug}/orders/${orderCode}/track`;

  // Group items by category for compact display
  const itemsByCategory: Record<string, number> = {};
  for (const item of order.items) {
    const key =
      item.service.category === "KILOAN" || item.service.category === "EXPRESS"
        ? `${item.service.name}`
        : item.service.name;
    if (item.service.category === "KILOAN" || item.service.category === "EXPRESS") {
      itemsByCategory[key] = (itemsByCategory[key] || 0) + item.quantity;
    } else {
      itemsByCategory[key] = (itemsByCategory[key] || 0) + item.quantity;
    }
  }

  const totalQty = Object.values(itemsByCategory).reduce((sum, qty) => sum + qty, 0);
  const firstItem = order.items[0];

  return (
    <main className="min-h-screen bg-background print:bg-white">
      <header className="border-b bg-card print:hidden">
        <div className="container flex min-h-14 items-center justify-between py-4">
          <div>
            <h1 className="font-display text-xl font-bold">Label Kemasan</h1>
            <p className="font-mono text-sm text-muted-foreground">{order.orderNumber}</p>
          </div>
          <Link href={`/${slug}/pos/orders`} className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
        </div>
      </header>

      <div className="container max-w-sm space-y-3 py-4 print:p-0">
      <div className="mx-auto max-w-[320px] rounded-xl border-2 border-foreground bg-white p-4 font-mono text-sm print:shadow-none">
      <MarkLabelPrinted slug={slug} orderId={order.id} />
      <div className="mb-2 border-b-2 border-dashed pb-2 text-center">
        <p className="font-display text-lg font-extrabold uppercase">{store.name}</p>
        <p className="text-[10px]">Label Kemasan</p>
      </div>

      <p className="text-center font-mono text-xl font-extrabold">{order.orderNumber}</p>
      <div className="my-3 flex justify-center">
        <QRCodeSVG value={trackingUrl} size={72} />
      </div>

      <div className="my-2 rounded bg-foreground py-2 text-center text-background">
        <p className="font-display text-2xl font-bold">{order.customer?.name ?? "Pelanggan Umum"}</p>
        {order.customer?.phone ? <p className="text-xs">{order.customer.phone}</p> : null}
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
        <div className="rounded border p-2">
          <p className="text-[10px] font-bold uppercase text-muted-foreground">Berat / Qty</p>
          <p className="text-base font-bold">
            {firstItem && (firstItem.service.category === "KILOAN" || firstItem.service.category === "EXPRESS")
              ? `${(totalQty / 1000).toFixed(1)} kg`
              : `${totalQty}x`}
          </p>
        </div>
        <div className="rounded border p-2">
          <p className="text-[10px] font-bold uppercase text-muted-foreground">Layanan</p>
          <p className="text-xs font-semibold leading-tight">{firstItem?.service.name ?? "Laundry"}</p>
        </div>
      </div>

      <div className="my-2 border-y border-black py-1">
        {Object.entries(itemsByCategory).map(([name, qty]) => {
          const isKiloan = name.toLowerCase().includes("kiloan") ||
            name.toLowerCase().includes("express");
          const displayQty = isKiloan
            ? `${(qty / 1000).toFixed(1)}kg`
            : `${qty}x`;
          return (
            <div key={name} className="flex justify-between text-xs">
              <span>{name}</span>
              <span>
                {displayQty}
                {isKiloan && order.items.some(i => i.service.category === "EXPRESS")
                  ? " (1.5x)"
                  : ""}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mb-4 rounded border p-2 text-xs">
        <p>
          Masuk:{" "}
          {new Date(order.createdAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
        {order.estimatedReadyAt && (
          <p>
            Estimasi:{" "}
            {new Date(order.estimatedReadyAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        )}
      </div>

      </div>
      <LabelActions slug={slug} orderCode={orderCode} />
    </div>
    </main>
  );
}
