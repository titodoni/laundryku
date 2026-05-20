import { NavLink, useParams } from "react-router-dom";
import { LayoutDashboard, Receipt, Users, UserCog, Tag, Wallet, CreditCard, Settings, Shirt } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "", label: "Dashboard", icon: LayoutDashboard },
  { to: "orders", label: "Order", icon: Receipt },
  { to: "customers", label: "Pelanggan", icon: Users },
  { to: "staff", label: "Staf", icon: UserCog },
  { to: "services", label: "Layanan", icon: Tag },
  { to: "finance", label: "Finance", icon: Wallet },
  { to: "billing", label: "Billing", icon: CreditCard },
  { to: "settings", label: "Pengaturan", icon: Settings },
];

export function SidebarNav() {
  const { slug } = useParams();
  const base = `/${slug}/dashboard`;
  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-card lg:flex lg:flex-col">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Shirt className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold">Laundryku</span>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {items.map(({ to, label, icon: Icon }) => {
          const url = to ? `${base}/${to}` : base;
          return (
            <NavLink
              key={label} to={url} end={to === ""}
              className={({ isActive }) => cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                isActive ? "bg-primary-soft text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}>
              <Icon className="h-4 w-4" /> {label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}