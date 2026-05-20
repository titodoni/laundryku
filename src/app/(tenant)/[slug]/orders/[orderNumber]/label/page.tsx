import { db } from "@/lib/db";
import { notFound } from "next/navigation";

/**
 * Packaging label page — resource-centric URL (not nested under /pos/).
 * Accessible from POS, dashboard, or direct link.
 *
 * URL: /{slug}/orders/{orderNumber}/label
 * Print format: 80mm thermal label paper
 */
export default async function LabelPage({
  params,
}: {
  params: { slug: string; orderNumber: string };
}) {
  const { slug, orderNumber } = params;

  const store = await db.store.findUnique({
    where: { slug },
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
      customer: true,
      branch: true,
    },
  });

  if (!order) notFound();

  // Mark label as printed
  if (!order.packagingLabelPrinted) {
    await db.order.update({
      where: { id: order.id },
      data: { packagingLabelPrinted: true },
    });
  }

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

  return (
    <div className="mx-auto max-w-[80mm] p-2 font-mono text-sm">
      {/* Order Number */}
      <div className="mb-2 border-b-2 border-black pb-1 text-center text-lg font-bold">
        {order.orderNumber}
      </div>

      {/* Customer */}
      {order.customer && (
        <div className="mb-2">
          <p className="font-bold">{order.customer.name}</p>
          {order.customer.phone && <p className="text-xs">{order.customer.phone}</p>}
        </div>
      )}

      {/* Items */}
      <div className="mb-2 border-y border-black py-1">
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

      {/* Dates */}
      <div className="mb-4 text-xs">
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

      {/* Print Button */}
      <div className="no-print">
        <button
          onClick={() => window.print()}
          className="w-full rounded bg-teal-600 px-4 py-2 text-white hover:bg-teal-700"
        >
          Cetak Label
        </button>
        <a
          href={`/${slug}/orders/${orderNumber}/receipt`}
          className="mt-2 block w-full rounded bg-gray-200 px-4 py-2 text-center text-gray-700 hover:bg-gray-300"
        >
          Lihat Struk
        </a>
      </div>
    </div>
  );
}
