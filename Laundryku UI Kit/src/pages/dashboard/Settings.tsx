import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Link, useParams } from "react-router-dom";
import { Building2, CreditCard, Image, Users, Shield, Receipt } from "lucide-react";

const sections = [
  { to: "branch", title: "Cabang", desc: "Nama, kode, alamat cabang", icon: Building2 },
  { to: "payment-methods", title: "Metode Pembayaran", desc: "Tunai, Transfer, QRIS", icon: CreditCard },
  { to: "../staff", title: "Staf", desc: "Manajemen staf & PIN", icon: Users },
  { to: "../services", title: "Layanan", desc: "Atur harga & kategori", icon: Receipt },
  { to: "../billing", title: "Billing", desc: "Langganan & invoice", icon: Shield },
  { to: "branch", title: "Logo & QRIS", desc: "Upload aset toko", icon: Image },
];

export default function Settings() {
  const { slug } = useParams();
  return (
    <DashboardLayout subtitle="Pengaturan toko">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map(s => (
          <Link key={s.title} to={`/${slug}/dashboard/settings/${s.to}`.replace("/settings/../","/")}
            className="group rounded-xl border border-border bg-card p-4 transition hover:border-primary hover:shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <s.icon className="h-5 w-5" />
            </div>
            <p className="mt-3 font-semibold">{s.title}</p>
            <p className="text-xs text-muted-foreground">{s.desc}</p>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
}