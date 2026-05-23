import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { paymentMethods } from "@/mocks/data";
import { Plus, Banknote, CreditCard, QrCode } from "lucide-react";
import { SettingsTabs } from "./SettingsOrg";

const icons = { CASH: Banknote, TRANSFER: CreditCard, QRIS: QrCode };

const SettingsPayments = () => {
  return (
    <AppShell title="Pengaturan" subtitle="Metode pembayaran" right={
      <Button size="sm" className="bg-gradient-primary"><Plus className="h-4 w-4 mr-1" /> Metode</Button>
    }>
      <SettingsTabs />
      <div className="container py-4 max-w-2xl space-y-3">
        {paymentMethods.map(m => {
          const Icon = icons[m.channel];
          return (
            <div key={m.id} className="rounded-xl border bg-card p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary-soft text-primary grid place-items-center"><Icon className="h-5 w-5" /></div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{m.label}</p>
                {m.details && <p className="text-xs text-muted-foreground truncate">{m.details}</p>}
              </div>
              <Switch defaultChecked={m.active} />
            </div>
          );
        })}
      </div>
    </AppShell>
  );
};

export default SettingsPayments;
