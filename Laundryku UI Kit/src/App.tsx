import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import TenantHome from "./pages/TenantHome";
import TenantLogin from "./pages/TenantLogin";
import Tracking from "./pages/Tracking";
import DashboardHome from "./pages/dashboard/DashboardHome";
import DashOrders from "./pages/dashboard/Orders";
import DashCustomers from "./pages/dashboard/Customers";
import DashStaff from "./pages/dashboard/Staff";
import DashServices from "./pages/dashboard/Services";
import DashSettings from "./pages/dashboard/Settings";
import DashSettingsBranch from "./pages/dashboard/SettingsBranch";
import DashSettingsPayment from "./pages/dashboard/SettingsPayment";
import DashFinance from "./pages/dashboard/Finance";
import DashExpenses from "./pages/dashboard/Expenses";
import DashIncome from "./pages/dashboard/Income";
import DashBilling from "./pages/dashboard/Billing";
import POS from "./pages/pos/POS";
import POSOrders from "./pages/pos/POSOrders";
import Receipt from "./pages/pos/Receipt";
import LabelPage from "./pages/pos/Label";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/register" element={<Register />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/:slug" element={<TenantHome />} />
          <Route path="/:slug/login" element={<TenantLogin />} />
          <Route path="/:slug/orders/:orderCode/track" element={<Tracking />} />
          <Route path="/:slug/dashboard" element={<DashboardHome />} />
          <Route path="/:slug/dashboard/orders" element={<DashOrders />} />
          <Route path="/:slug/dashboard/customers" element={<DashCustomers />} />
          <Route path="/:slug/dashboard/staff" element={<DashStaff />} />
          <Route path="/:slug/dashboard/services" element={<DashServices />} />
          <Route path="/:slug/dashboard/settings" element={<DashSettings />} />
          <Route path="/:slug/dashboard/settings/branch" element={<DashSettingsBranch />} />
          <Route path="/:slug/dashboard/settings/payment-methods" element={<DashSettingsPayment />} />
          <Route path="/:slug/dashboard/finance" element={<DashFinance />} />
          <Route path="/:slug/dashboard/finance/expenses" element={<DashExpenses />} />
          <Route path="/:slug/dashboard/finance/income" element={<DashIncome />} />
          <Route path="/:slug/dashboard/billing" element={<DashBilling />} />
          <Route path="/:slug/pos" element={<POS />} />
          <Route path="/:slug/pos/orders" element={<POSOrders />} />
          <Route path="/:slug/pos/receipt/:orderNumber" element={<Receipt />} />
          <Route path="/:slug/pos/label/:orderNumber" element={<LabelPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
