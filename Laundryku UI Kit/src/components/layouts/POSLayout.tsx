import { ReactNode } from "react";
import { NavLink, useParams, Link } from "react-router-dom";
import { ShoppingBag, ListOrdered, Users, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { branches, staffMembers } from "@/lib/mock-data";
import { formatIDR } from "@/lib/status-labels";

export function POSLayout({ children, hideNav = false }: { children: ReactNode; hideNav?: boolean }) {
  const { slug } = useParams();
  const branch = branches[0];
  const cashier = staffMembers[0];
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-card px-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{branch.name}</p>
          <p className="truncate text-xs text-muted-foreground">Kasir: {cashier.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-success-soft px-2 py-1 text-xs font-medium text-success">
            Hari ini · {formatIDR(420000)}
          </div>
          <Link to={`/${slug}/login`} className="tap-target inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted">
            <LogOut className="h-4 w-4" />
          </Link>
        </div>
      </header>
      <main className={cn("flex-1", !hideNav && "pb-20")}>{children}</main>
      {!hideNav && (
        <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-border bg-card">
          {[
            { to: "pos", label: "POS", icon: ShoppingBag, end: true },
            { to: "pos/orders", label: "Order", icon: ListOrdered },
            { to: "dashboard/customers", label: "Pelanggan", icon: Users },
            { to: "login", label: "Profil", icon: User },
          ].map(({ to, label, icon: Icon, end }) => (
            <NavLink key={label} to={`/${slug}/${to}`} end={end} className={({ isActive }) => cn(
              "flex flex-col items-center justify-center gap-0.5 py-2 text-[11px]",
              isActive ? "text-primary" : "text-muted-foreground"
            )}>
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}