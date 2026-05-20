import { AlertTriangle } from "lucide-react";

export function ErrorState({ title = "Terjadi kesalahan", description }: { title?: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-destructive/30 bg-destructive-soft px-6 py-10 text-center">
      <AlertTriangle className="mb-2 h-6 w-6 text-destructive" />
      <h3 className="text-sm font-semibold text-destructive">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}