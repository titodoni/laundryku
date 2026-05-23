import { Link, useParams } from "react-router-dom";
import { orders } from "@/mocks/data";
import { TrackingTimeline } from "@/components/TrackingTimeline";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatTanggal, formatJam, formatRupiah } from "@/lib/format";
import { ArrowLeft, MessageCircle, Phone } from "lucide-react";

const Track = () => {
  const { code } = useParams();
  const order = orders.find(o => o.code === code) ?? orders[0];

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="bg-gradient-hero text-primary-foreground">
        <div className="container py-4">
          <Link to="/melati-clean" className="inline-flex items-center gap-1 text-sm opacity-90 hover:opacity-100">
            <ArrowLeft className="h-4 w-4" /> Melati Clean
          </Link>
          <div className="mt-4">
            <p className="text-xs opacity-90">Nomor Pesanan</p>
            <p className="font-mono font-extrabold text-2xl">{order.code}</p>
          </div>
        </div>
      </header>

      <div className="container py-5 max-w-md space-y-4">
        <div className="rounded-2xl border bg-card p-4 shadow-soft">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge kind="order" status={order.status} />
            <StatusBadge kind="payment" status={order.paymentStatus} />
          </div>
          <p className="mt-3 font-semibold font-display">Halo, {order.customerName}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Estimasi selesai {formatTanggal(order.estimatedReadyAt)} pukul {formatJam(order.estimatedReadyAt)}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground">Layanan</p>
              <p className="font-semibold">{order.items[0].serviceName}</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-semibold text-primary">{formatRupiah(order.total)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-4">
          <h2 className="font-semibold font-display mb-3">Status Cucian</h2>
          <TrackingTimeline current={order.status} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="h-11" asChild>
            <a href="tel:0812-3456-7890"><Phone className="h-4 w-4 mr-1" /> Telepon</a>
          </Button>
          <Button className="h-11 bg-gradient-primary shadow-glow" asChild>
            <a href="https://wa.me/6281234567890"><MessageCircle className="h-4 w-4 mr-1" /> WhatsApp</a>
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground pt-2">
          Powered by <Link to="/" className="text-primary font-semibold">Laundryku</Link>
        </p>
      </div>
    </div>
  );
};

export default Track;
