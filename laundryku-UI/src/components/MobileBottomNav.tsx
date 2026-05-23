import { NavLink } from "react-router-dom";
import { LayoutDashboard, ShoppingCart, ListChecks, Wallet, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/melati-clean/dashboard", label: "Beranda", icon: LayoutDashboard, end: true },
  { to: "/melati-clean/pos", label: "Kasir", icon: ShoppingCart },
  { to: "/melati-clean/pos/orders", label: "Pesanan", icon: ListChecks },
  { to: "/melati-clean/dashboard/finance", label: "Keuangan", icon: Wallet },
  { to: "/melati-clean/dashboard/settings", label: "Lainnya", icon: Settings },
];

export function MobileBottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur border-t safe-bottom">
      <div className="grid grid-cols-5 max-w-md mx-auto">
        {items.map(i => (
          <NavLink key={i.to} to={i.to} end={(i as any).end}
            className={({ isActive }) => cn(
              "flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium",
              isActive ? "text-primary" : "text-muted-foreground"
            )}>
            <i.icon className="h-5 w-5" />
            <span>{i.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
