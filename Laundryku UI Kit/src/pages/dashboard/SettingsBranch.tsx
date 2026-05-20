import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { branches } from "@/lib/mock-data";

export default function SettingsBranch() {
  const b = branches[0];
  return (
    <DashboardLayout subtitle="Pengaturan cabang">
      <div className="max-w-xl space-y-4">
        <h2 className="text-lg font-semibold">Cabang</h2>
        <div className="space-y-3 rounded-xl border border-border bg-card p-5">
          <div className="space-y-1.5"><Label>Nama cabang</Label><Input defaultValue={b.name} /></div>
          <div className="space-y-1.5">
            <Label>Kode cabang</Label><Input defaultValue={b.code} />
            <div className="flex items-start gap-2 rounded-md bg-warning-soft px-3 py-2 text-xs text-warning-foreground">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-warning" />
              <span>Kode cabang dipakai untuk nomor order. Mengubahnya tidak memengaruhi order lama.</span>
            </div>
          </div>
          <div className="space-y-1.5"><Label>Alamat</Label><Input defaultValue={b.address} /></div>
          <div className="space-y-1.5"><Label>Telepon</Label><Input defaultValue={b.phone} /></div>
          <Button className="tap-target">Simpan Perubahan</Button>
        </div>
      </div>
    </DashboardLayout>
  );
}