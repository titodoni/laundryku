import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { paymentMethods } from "@/lib/mock-data";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MockUploadBox } from "@/components/shared/MockUploadBox";
import { QRCodePlaceholder } from "@/components/shared/QRCodePlaceholder";

export default function SettingsPayment() {
  return (
    <DashboardLayout subtitle="Metode pembayaran">
      <div className="max-w-2xl space-y-4">
        <h2 className="text-lg font-semibold">Metode Pembayaran</h2>
        {paymentMethods.map(pm => (
          <div key={pm.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{pm.displayName}</p>
                <p className="text-xs text-muted-foreground">Tipe: {pm.type}</p>
              </div>
              <Switch defaultChecked={pm.active} />
            </div>
            <div className="mt-3 space-y-2">
              <Label className="text-xs">Nama tampilan</Label>
              <Input defaultValue={pm.displayName} />
            </div>
            {pm.type === "QRIS" && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <MockUploadBox label="Upload QRIS" />
                <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-muted/30 p-3">
                  <QRCodePlaceholder size={100} label="Preview QRIS" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}