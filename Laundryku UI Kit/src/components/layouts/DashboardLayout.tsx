import { ReactNode } from "react";
import { SidebarNav } from "./SidebarNav";
import { Topbar } from "./Topbar";
import { BottomNav } from "./BottomNav";

export function DashboardLayout({ children, subtitle }: { children: ReactNode; subtitle?: string }) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <SidebarNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar subtitle={subtitle} />
        <main className="flex-1 pb-20 lg:pb-6">
          <div className="container max-w-6xl py-4 sm:py-6">{children}</div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}