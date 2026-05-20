import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { organizations, subscription, invoices } from "@/lib/mock-data";
import { formatIDR, formatDateID, orgStatusLabel } from "@/lib/status-labels";
import { Button } from "@/components/ui/button";
import { Check, Crown } from "lucide-react";
import { useParams } from "react-router-dom";

export default function Billing() {
  const { slug } = useParams();
  const org = organizations.find(o => o.slug === slug) ?? organizations[0];
  const trialDays = subscription.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(subscription.trialEndsAt).getTime() - Date.now())/86400000)) : 0;

  return (
    <DashboardLayout subtitle="Langganan & invoice">
      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-medium text-muted-foreground">Paket Saat Ini</p>
            <p className="mt-1 text-2xl font-bold">{org.plan}</p>
            <p className="text-sm text-muted-foreground">Status: {orgStatusLabel[org.status]}</p>
            {org.status === "TRIALING" && (
              <p className="mt-2 rounded-md bg-primary-soft px-3 py-2 text-sm text-primary">
                Trial Pro berakhir dalam {trialDays} hari.
              </p>
            )}
          </div>

          <div className="rounded-xl border-2 border-primary bg-card p-5">
            <div className="flex items-center gap-2 text-primary">
              <Crown className="h-5 w-5" /><span className="text-sm font-semibold">Paket Pro</span>
            </div>
            <p className="mt-2 text-3xl font-bold">Rp65.000<span className="text-base font-normal text-muted-foreground">/bulan</span></p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {["Order unlimited","Staff unlimited","Cabang unlimited","Finance & analytics penuh","Export data"].map(i =>
                <li key={i} className="flex gap-2"><Check className="h-4 w-4 text-success" /> {i}</li>)}
            </ul>
            <div className="mt-4 flex gap-2">
              <Button className="flex-1 tap-target">Upgrade ke Pro</Button>
              <Button variant="outline" className="flex-1 tap-target">Perpanjang</Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Pembayaran via Midtrans Snap.</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-semibold">Riwayat Invoice</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr><th className="py-2">Nomor</th><th className="py-2">Tanggal</th><th className="py-2">Status</th><th className="py-2 text-right">Jumlah</th></tr>
              </thead>
              <tbody>
                {invoices.map(i => (
                  <tr key={i.id} className="border-t border-border">
                    <td className="py-3 font-medium">{i.number}</td>
                    <td className="py-3 text-muted-foreground">{formatDateID(i.issuedAt)}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        i.status === "PAID" ? "bg-success-soft text-success" :
                        i.status === "PENDING" ? "bg-warning-soft text-warning" :
                        "bg-destructive-soft text-destructive"
                      }`}>{i.status}</span>
                    </td>
                    <td className="py-3 text-right tabular-nums">{formatIDR(i.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}