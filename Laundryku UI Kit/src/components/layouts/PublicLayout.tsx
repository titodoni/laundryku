import { Link } from "react-router-dom";
import { ReactNode } from "react";
import { Shirt } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Shirt className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">Laundryku</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#fitur" className="hover:text-foreground">Fitur</a>
            <a href="#harga" className="hover:text-foreground">Harga</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/laundry-melati">Demo</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/laundry-melati/login">Masuk</Link>
            </Button>
            <Button asChild size="sm"><Link to="/register">Daftar Gratis</Link></Button>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-border bg-card">
        <div className="container flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Shirt className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold">Laundryku</span>
            <span className="text-xs text-muted-foreground">© 2026</span>
          </div>
          <p className="text-xs text-muted-foreground">Dibuat untuk laundry kiloan Indonesia.</p>
        </div>
      </footer>
    </div>
  );
}