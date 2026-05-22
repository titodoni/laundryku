"use client";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Settings2,
  Sparkles,
  Store,
  UserCog,
  Users,
  Wallet,
  Package2,
  CreditCard,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

type DashboardShellProps = {
  storeName: string;
  userName: string;
  branchName?: string | null;
  trialEndsAt?: string | null;
  subscriptionStatus?: string | null;
  children: ReactNode;
};

type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  disabled?: boolean;
  future?: boolean;
};

const navItems: NavItem[] = [
  { label: "Ringkasan", href: "", icon: LayoutDashboard },
  { label: "Pesanan", href: "orders", icon: Receipt, disabled: true, future: true },
  { label: "Pelanggan", href: "customers", icon: Users, disabled: true, future: true },
  { label: "Staf", href: "staff", icon: UserCog },
  { label: "Layanan & Harga", href: "services", icon: Package2 },
  { label: "Metode Pembayaran", href: "payment-methods", icon: CreditCard },
  { label: "Cabang / Pengaturan Cabang", href: "branch", icon: Settings2 },
  { label: "Tagihan", href: "billing", icon: Wallet, disabled: true, future: true },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function isActivePath(pathname: string, basePath: string, href: string) {
  const target = href ? `${basePath}/${href}` : basePath;
  return pathname === target || pathname.startsWith(`${target}/`);
}

function UserMenu({ userName, onLogout }: { userName: string; onLogout: () => Promise<void> }) {
  const initials = useMemo(() => getInitials(userName), [userName]);
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-3 rounded-full border border-border bg-card px-3 py-2 text-left shadow-sm transition hover:bg-muted/50"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
          {initials || "O"}
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="block text-sm font-semibold leading-none">{userName}</span>
          <span className="mt-1 block text-xs text-muted-foreground">Pemilik</span>
        </span>
        <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
      </button>

      {open ? (
        <div
          className="absolute right-0 z-40 mt-2 w-52 overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-lg"
          role="menu"
          aria-label="Menu pengguna"
        >
          <button
            type="button"
            onClick={async () => {
              setOpen(false);
              await onLogout();
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </button>
        </div>
      ) : null}
    </div>
  );
}

function BranchPlaceholder({ branchName }: { branchName?: string | null }) {
  return (
    <button
      type="button"
      disabled
      className="inline-flex min-h-11 min-w-[10rem] items-center justify-between gap-3 rounded-full border border-dashed border-border bg-card px-4 py-2 text-left text-sm text-muted-foreground opacity-90"
      aria-label="Cabang aktif sementara"
      title="Pemilihan cabang menyusul"
    >
      <span className="min-w-0">
        <span className="block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Cabang aktif</span>
        <span className="block truncate font-semibold text-foreground">{branchName || "Cabang utama"}</span>
      </span>
      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
    </button>
  );
}

export function DashboardShell({
  storeName,
  userName,
  branchName,
  trialEndsAt,
  subscriptionStatus,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const basePath = `/${slug}/dashboard`;
  const isTrialing = subscriptionStatus === "TRIALING";

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await authClient.signOut();
    router.replace(`/${slug}/login`);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_35%),linear-gradient(180deg,_rgba(248,250,252,1)_0%,_rgba(255,255,255,1)_100%)]">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-border/70 bg-card/95 backdrop-blur md:flex md:flex-col">
        <div className="flex h-16 items-center gap-3 border-b border-border/70 px-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Store className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{storeName}</p>
            <p className="text-xs text-muted-foreground">Dashboard pemilik</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const active = !item.disabled && isActivePath(pathname, basePath, item.href);
            const canNavigate = !item.disabled;

            if (!canNavigate) {
              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm text-muted-foreground opacity-70"
                  aria-disabled="true"
                >
                  <span className="flex items-center gap-3">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide">
                    Segera
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href ? `${basePath}/${item.href}` : basePath}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                  active
                    ? "bg-primary-soft text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="flex-1">{item.label}</span>
                {active ? <ChevronRight className="h-4 w-4" /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border/70 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Catatan</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Kelola staf dan layanan dari sidebar. Fitur dashboard lain akan dibuka bertahap di slice berikutnya.
          </p>
        </div>
      </aside>

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setMobileNavOpen(false)}>
          <div
            className="absolute inset-y-0 left-0 w-[85vw] max-w-sm border-r border-border bg-card p-4 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="text-sm font-semibold">{storeName}</p>
                <p className="text-xs text-muted-foreground">Menu dashboard</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-full border border-border p-2 text-muted-foreground transition hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="mt-4 space-y-1">
              {navItems.map((item) => {
                const active = !item.disabled && isActivePath(pathname, basePath, item.href);
                const canNavigate = !item.disabled;

                if (!canNavigate) {
                  return (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm text-muted-foreground opacity-70"
                    >
                      <span className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide">
                        Segera
                      </span>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    href={item.href ? `${basePath}/${item.href}` : basePath}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                      active
                        ? "bg-primary-soft text-primary shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-4 rounded-2xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              Tagihan masih dikunci sebagai fitur fase berikutnya pada slice ini.
            </div>
          </div>
        </div>
      ) : null}

      <div className="min-h-screen md:pl-72">
        <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur">
          <div className="flex min-h-16 items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground md:hidden"
              aria-label="Buka menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{storeName}</p>
              <p className="truncate text-xs text-muted-foreground">
                {isTrialing
                  ? "Masa trial aktif"
                  : "Dashboard operasional untuk owner"}
              </p>
            </div>

            <div className="hidden items-center gap-3 lg:flex">
              <BranchPlaceholder branchName={branchName} />
              <UserMenu userName={userName} onLogout={handleLogout} />
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <BranchPlaceholder branchName={branchName} />
              <UserMenu userName={userName} onLogout={handleLogout} />
            </div>
          </div>
        </header>

        {isTrialing ? (
          <section className="border-b border-warning/30 bg-warning-soft px-4 py-4 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-6xl flex-col gap-2 rounded-2xl border border-warning/20 bg-white/80 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning text-warning-foreground">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-warning-foreground">Trial aktif</p>
                  <p className="text-sm text-warning-foreground/80">
                    {trialEndsAt
                      ? `Trial berakhir pada ${new Intl.DateTimeFormat("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        }).format(new Date(trialEndsAt))}.`
                      : "Akun ini masih berada di masa trial."}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center rounded-full bg-warning px-3 py-1 text-xs font-semibold uppercase tracking-wide text-warning-foreground">
                Billing nanti
              </span>
            </div>
          </section>
        ) : null}

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
