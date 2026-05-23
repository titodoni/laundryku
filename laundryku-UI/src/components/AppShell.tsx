import { ReactNode } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { PlanBadge } from "./PlanBadge";
import { org } from "@/mocks/data";
import { Bell, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface Props {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showSidebar?: boolean;
  showBottomNav?: boolean;
  back?: string;
  right?: ReactNode;
}

export function AppShell({ children, title, subtitle, showSidebar = true, showBottomNav = true, back, right }: Props) {
  const nav = useNavigate();
  return (
    <div className="min-h-screen bg-background flex w-full">
      {showSidebar && <DashboardSidebar />}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-card/90 backdrop-blur border-b">
          <div className="flex items-center gap-3 px-3 lg:px-6 h-14">
            {back ? (
              <button onClick={() => back === "back" ? nav(-1) : nav(back)} className="lg:hidden -ml-1 p-1.5 rounded-lg hover:bg-muted">
                <ArrowLeft className="h-5 w-5" />
              </button>
            ) : (
              <Link to="/melati-clean" className="lg:hidden flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-primary text-primary-foreground grid place-items-center font-bold text-sm">M</div>
              </Link>
            )}
            <div className="flex-1 min-w-0">
              {title && <h1 className="font-semibold font-display text-base lg:text-lg truncate">{title}</h1>}
              {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2">
              {right}
              <PlanBadge plan={org.plan} status={org.subscriptionStatus} className="hidden sm:inline-flex" />
              <button className="p-2 rounded-lg hover:bg-muted relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 pb-20 lg:pb-6">{children}</main>
        {showBottomNav && <MobileBottomNav />}
      </div>
    </div>
  );
}
