import { useParams, Link } from "react-router-dom";
import { TenantPublicLayout } from "@/components/layouts/TenantPublicLayout";
import { organizations, services } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, MessageCircle, Search, LogIn, Shirt, Clock } from "lucide-react";
import { formatIDR } from "@/lib/status-labels";

export default function TenantHome() {
  const { slug } = useParams();
  const org = organizations.find(o => o.slug === slug) ?? organizations[0];
  return (
    <TenantPublicLayout>
      <div className="mx-auto max-w-2xl space-y-4">
        {/* Header card */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Shirt className="h-7 w-7" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold">{org.name}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /> {org.address}</p>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><Phone className="h-4 w-4" /> {org.phone}</p>
            </div>
          </div>
          <a href={`https://wa.me/${org.phone.replace(/\D/g,"")}`}
             className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-success px-4 py-2.5 text-sm font-medium text-success-foreground tap-target">
            <MessageCircle className="h-4 w-4" /> Chat via WhatsApp
          </a>
        </div>

        {/* Actions */}
        <div className="grid gap-3 sm:grid-cols-3">
          <Button asChild variant="outline" className="tap-target h-auto flex-col gap-1 py-4">
            <Link to={`/${slug}/orders/TRK1001/track`}><Search className="h-5 w-5" />Lacak Cucian</Link>
          </Button>
          <Button asChild variant="outline" className="tap-target h-auto flex-col gap-1 py-4">
            <Link to={`/${slug}/login`}><LogIn className="h-5 w-5" />Masuk Staff</Link>
          </Button>
          <Button asChild className="tap-target h-auto flex-col gap-1 py-4">
            <Link to={`/${slug}/login`}><LogIn className="h-5 w-5" />Masuk Owner</Link>
          </Button>
        </div>

        {/* Services */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold">Layanan kami</h2>
          <div className="mt-3 space-y-2">
            {services.slice(0,5).map(s => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">Min. {s.minQty} {s.unit}</p>
                </div>
                <span className="text-sm font-semibold">{formatIDR(s.price)}/{s.unit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" /> Buka setiap hari · 07:00 – 21:00
        </div>
      </div>
    </TenantPublicLayout>
  );
}