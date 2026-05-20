import { ReactNode } from "react";
import { Shirt } from "lucide-react";

export function TenantPublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-card">
        <div className="container flex h-14 items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shirt className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold">Laundryku</span>
        </div>
      </header>
      <main className="container py-6">{children}</main>
    </div>
  );
}