import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { org } from "@/mocks/data";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/melati-clean/dashboard/settings", label: "Organisasi" },
  { to: "/melati-clean/dashboard/settings/branch", label: "Cabang" },
  { to: "/melati-clean/dashboard/settings/payment-methods", label: "Metode Bayar" },
];

export function SettingsTabs() {
  const { pathname } = useLocation();
  return (
    <div className="border-b">
      <div className="container flex gap-1 overflow-x-auto">
        {tabs.map(t => {
          const active = pathname === t.to;
          return (
            <Link key={t.to} to={t.to}
              className={cn("px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px",
                active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
              {t.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

const SettingsOrg = () => {
  return (
    <AppShell title="Pengaturan" subtitle="Profil organisasi">
      <SettingsTabs />
      <div className="container py-4 max-w-2xl space-y-3">
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <h3 className="font-semibold font-display">Profil Organisasi</h3>
          <div><Label>Nama Usaha</Label><Input className="h-11 mt-1.5" defaultValue={org.name} /></div>
          <div><Label>Slug Publik</Label>
            <div className="mt-1.5 flex items-center rounded-md border bg-background overflow-hidden">
              <span className="px-3 text-xs text-muted-foreground">laundryku.id/</span>
              <Input className="h-11 border-0 focus-visible:ring-0" defaultValue={org.slug} />
            </div>
          </div>
          <div><Label>Email Kontak</Label><Input className="h-11 mt-1.5" defaultValue="hello@melaticlean.id" /></div>
        </div>
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <h3 className="font-semibold font-display">Logo & Branding</h3>
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 rounded-2xl bg-gradient-primary text-primary-foreground grid place-items-center font-bold text-2xl shadow-glow">M</div>
            <Button variant="outline">Unggah Logo</Button>
          </div>
        </div>
        <Button className="w-full h-11 bg-gradient-primary shadow-glow font-semibold">Simpan Perubahan</Button>
      </div>
    </AppShell>
  );
};

export default SettingsOrg;
