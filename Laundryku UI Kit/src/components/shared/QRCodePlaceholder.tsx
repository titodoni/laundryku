import { QrCode } from "lucide-react";
export function QRCodePlaceholder({ size = 120, label }: { size?: number; label?: string }) {
  return (
    <div className="inline-flex flex-col items-center gap-1">
      <div className="flex items-center justify-center rounded-md border border-border bg-white p-3"
        style={{ width: size, height: size }}>
        <QrCode className="h-full w-full text-foreground" />
      </div>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </div>
  );
}