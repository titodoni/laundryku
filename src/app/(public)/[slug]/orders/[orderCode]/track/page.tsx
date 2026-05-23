import { ImportedStatusBadge, ImportedTrackingTimeline } from "@/components/imported-ui";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { buildOrderTimeline } from "@/lib/order-timeline";
import { formatOrderStatusDebugLabel, normalizeOrderStatus } from "@/lib/order-status";
import { ArrowLeft, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

type TrackPageProps = {
  params: {
    slug: string;
    orderCode: string;
  };
  searchParams: {
    phone?: string;
  };
};

function formatIDR(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export default async function TrackPage({ params, searchParams }: TrackPageProps) {
  const store = await db.store.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      name: true,
      phone: true,
      whatsappPhone: true,
    },
  });

  if (!store) notFound();

  const order = await db.order.findFirst({
    where: {
      storeId: store.id,
      orderNumber: params.orderCode,
      deletedAt: null,
    },
    include: {
      customer: true,
      items: { include: { service: true } },
    },
  });

  if (!order) notFound();

  const activityLogs = await db.activityLog.findMany({
    where: {
      storeId: store.id,
      targetType: "order",
      targetId: order.id,
      action: {
        in: ["order.created", "order.status_changed"],
      },
    },
    orderBy: { createdAt: "asc" },
    select: {
      action: true,
      createdAt: true,
      details: true,
    },
  });

  const requestedPhone = searchParams.phone?.replace(/\D/g, "");
  const customerPhone = order.customer?.phone?.replace(/\D/g, "");
  const phoneMatches = !customerPhone || !requestedPhone || customerPhone.endsWith(requestedPhone) || requestedPhone.endsWith(customerPhone);

  if (!phoneMatches) {
    notFound();
  }

  const firstItem = order.items[0];
  const whatsappPhone = store.whatsappPhone || store.phone;
  const whatsappHref = whatsappPhone
    ? `https://wa.me/${whatsappPhone.replace(/\D/g, "")}?text=${encodeURIComponent(`Halo, saya mau tanya pesanan ${order.orderNumber}`)}`
    : null;
  const currentStatus = normalizeOrderStatus(order.status);
  const timeline = buildOrderTimeline({
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    estimatedReadyAt: order.estimatedReadyAt,
    completedAt: order.completedAt,
    cancelledAt: order.cancelledAt,
    activityLogs,
  });

  return (
    <main className="min-h-screen bg-gradient-soft">
      <header className="bg-gradient-hero text-primary-foreground">
        <div className="container py-4">
          <Link href={`/${params.slug}`} className="inline-flex items-center gap-1 text-sm opacity-90 hover:opacity-100">
            <ArrowLeft className="h-4 w-4" /> {store.name}
          </Link>
          <div className="mt-4">
            <p className="text-xs opacity-90">Nomor Pesanan</p>
            <h1 className="font-mono text-2xl font-extrabold">{order.orderNumber}</h1>
          </div>
        </div>
      </header>

      <div className="container max-w-md space-y-4 py-5">
        <section className="rounded-2xl border bg-card p-4 shadow-soft">
          <div className="flex flex-wrap items-center gap-2">
            <ImportedStatusBadge kind="order" status={currentStatus} />
            <ImportedStatusBadge kind="payment" status={order.paymentStatus} />
          </div>
          <p className="mt-3 text-sm font-medium text-foreground">{formatOrderStatusDebugLabel(currentStatus)}</p>
          <p className="mt-3 font-display font-semibold">
            Halo, {order.customer?.name ?? "Pelanggan"}
          </p>
          {order.estimatedReadyAt ? (
            <p className="mt-1 text-sm text-muted-foreground">
              Estimasi selesai {order.estimatedReadyAt.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}{" "}
              pukul {order.estimatedReadyAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
            </p>
          ) : null}
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground">Layanan</p>
              <p className="font-semibold">{firstItem?.service.name ?? "Laundry"}</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-semibold text-primary">{formatIDR(order.totalAmount)}</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-4">
          <h2 className="mb-3 font-display font-semibold">Riwayat Pesanan</h2>
          <ImportedTrackingTimeline entries={timeline} />
        </section>

        <div className="grid grid-cols-2 gap-2">
          {store.phone ? (
            <Button variant="outline" className="h-11" asChild>
              <a href={`tel:${store.phone}`}>
                <Phone className="mr-1 h-4 w-4" /> Telepon
              </a>
            </Button>
          ) : null}
          {whatsappHref ? (
            <Button className="h-11 bg-gradient-primary shadow-glow" asChild>
              <a href={whatsappHref}>
                <MessageCircle className="mr-1 h-4 w-4" /> WhatsApp
              </a>
            </Button>
          ) : null}
        </div>

        <p className="pt-2 text-center text-xs text-muted-foreground">
          Powered by <Link href="/" className="font-semibold text-primary">LaundryKU</Link>
        </p>
      </div>
    </main>
  );
}
