import { NavLink, useParams } from "react-router-dom";
import { LayoutDashboard, Receipt, Users, UserCog, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "", label: "Home", icon: LayoutDashboard },
  { to: "orders", label: "Order", icon: Receipt },
  { to: "customers", label: "Pelanggan", icon: Users },
  { to: "finance", label: "Finance", icon: Wallet },
  { to: "staff", label: "Staf", icon: UserCog },
];

export function BottomNav() {
  const { slug } = useParams();
  const base = `/${slug}/dashboard`;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-card lg:hidden">
      {items.map(({ to, label, icon: Icon }) => {
        const url = to ? `${base}/${to}` : base;
        return (
          <NavLink key={label} to={url} end={to === ""} className={({ isActive }) => cn(
            "flex flex-col items-center justify-center gap-0.5 py-2 text-[11px]",
            isActive ? "text-primary" : "text-muted-foreground"
          )}>
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        );
      })}
    </nav>
  );
}