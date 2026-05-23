import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import TenantPublic from "./pages/TenantPublic";
import Login from "./pages/Login";
import Track from "./pages/Track";

import DashboardHome from "./pages/dashboard/DashboardHome";
import Services from "./pages/dashboard/Services";
import Staff from "./pages/dashboard/Staff";
import Customers from "./pages/dashboard/Customers";
import SettingsOrg from "./pages/dashboard/SettingsOrg";
import SettingsBranch from "./pages/dashboard/SettingsBranch";
import SettingsPayments from "./pages/dashboard/SettingsPayments";
import Finance from "./pages/dashboard/Finance";
import Income from "./pages/dashboard/Income";
import Expenses from "./pages/dashboard/Expenses";
import Billing from "./pages/dashboard/Billing";

import POS from "./pages/pos/POS";
import Orders from "./pages/pos/Orders";
import Receipt from "./pages/pos/Receipt";
import LabelPage from "./pages/pos/Label";

import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/onboarding" element={<Onboarding />} />

          <Route path="/melati-clean" element={<TenantPublic />} />
          <Route path="/melati-clean/login" element={<Login />} />

          <Route path="/melati-clean/dashboard" element={<DashboardHome />} />
          <Route path="/melati-clean/dashboard/services" element={<Services />} />
          <Route path="/melati-clean/dashboard/staff" element={<Staff />} />
          <Route path="/melati-clean/dashboard/customers" element={<Customers />} />
          <Route path="/melati-clean/dashboard/settings" element={<SettingsOrg />} />
          <Route path="/melati-clean/dashboard/settings/branch" element={<SettingsBranch />} />
          <Route path="/melati-clean/dashboard/settings/payment-methods" element={<SettingsPayments />} />
          <Route path="/melati-clean/dashboard/finance" element={<Finance />} />
          <Route path="/melati-clean/dashboard/finance/expenses" element={<Expenses />} />
          <Route path="/melati-clean/dashboard/finance/income" element={<Income />} />
          <Route path="/melati-clean/dashboard/billing" element={<Billing />} />

          <Route path="/melati-clean/pos" element={<POS />} />
          <Route path="/melati-clean/pos/orders" element={<Orders />} />
          <Route path="/melati-clean/pos/receipt/:code" element={<Receipt />} />
          <Route path="/melati-clean/pos/receipt/:code/label" element={<LabelPage />} />

          <Route path="/melati-clean/orders/:code/track" element={<Track />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
