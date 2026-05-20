import { Upload } from "lucide-react";

export function MockUploadBox({ label = "Upload gambar" }: { label?: string }) {
  return (
    <button type="button" className="tap-target flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/40 px-4 py-6 text-sm text-muted-foreground transition hover:border-primary hover:bg-primary-soft hover:text-primary">
      <Upload className="h-5 w-5" />
      <span>{label}</span>
      <span className="text-xs">PNG, JPG max 2MB</span>
    </button>
  );
}