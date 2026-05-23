import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Sparkles, Users, UserCog, Settings, Wallet, CreditCard, ShoppingBag, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlanBadge } from "./PlanBadge";
import { org } from "@/mocks/data";

const BASE = "/melati-clean/dashboard";

const main = [
  { to: BASE, label: "Beranda", icon: LayoutDashboard, end: true },
  { to: `${BASE}/services`, label: "Layanan", icon: Sparkles },
  { to: `${BASE}/customers`, label: "Pelanggan", icon: Users },
  { to: `${BASE}/staff`, label: "Staff", icon: UserCog },
];

const finance = [
  { to: `${BASE}/finance`, label: "Ringkasan", icon: Wallet, end: true },
  { to: `${BASE}/finance/income`, label: "Pemasukan", icon: ShoppingBag },
  { to: `${BASE}/finance/expenses`, label: "Pengeluaran", icon: CreditCard },
];

const settings = [
  { to: `${BASE}/settings`, label: "Organisasi", icon: Settings, end: true },
  { to: `${BASE}/settings/branch`, label: "Cabang", icon: Settings },
  { to: `${BASE}/settings/payment-methods`, label: "Metode Bayar", icon: CreditCard },
];

function Section({ title, items }: { title: string; items: typeof main }) {
  return (
    <div className="px-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 mb-1">{title}</p>
      <nav className="space-y-0.5">
        {items.map(i => (
          <NavLink key={i.to} to={i.to} end={(i as any).end}
            className={({ isActive }) => cn(
              "flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition",
              isActive ? "bg-primary-soft text-primary" : "text-foreground/70 hover:bg-muted hover:text-foreground"
            )}>
            <i.icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{i.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export function DashboardSidebar() {
  useLocation();
  return (
    <aside className="hidden lg:flex w-60 shrink-0 border-r bg-sidebar flex-col">
      <div className="p-4 border-b">
        <NavLink to="/melati-clean" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-primary text-primary-foreground grid place-items-center font-bold font-display shadow-glow">M</div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{org.name}</p>
            <PlanBadge plan={org.plan} status={org.subscriptionStatus} className="mt-0.5" />
          </div>
        </NavLink>
      </div>
      <div className="flex-1 overflow-y-auto py-3 space-y-4">
        <Section title="Operasional" items={main} />
        <Section title="Keuangan" items={finance} />
        <Section title="Pengaturan" items={settings} />
      </div>
      <div className="p-2 border-t">
        <NavLink to={`${BASE}/billing`} className={({ isActive }) => cn(
          "flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-sm font-medium",
          isActive ? "bg-primary-soft text-primary" : "text-foreground/70 hover:bg-muted"
        )}>
          <span className="inline-flex items-center gap-2"><CreditCard className="h-4 w-4" /> Tagihan</span>
          <ChevronRight className="h-4 w-4" />
        </NavLink>
      </div>
    </aside>
  );
}
