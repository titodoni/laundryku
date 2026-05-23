import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

interface Props { icon?: LucideIcon; title: string; description?: string; actionLabel?: string; actionTo?: string; }

export function EmptyState({ icon: Icon = Inbox, title, description, actionLabel, actionTo }: Props) {
  return (
    <div className="rounded-xl border-2 border-dashed bg-card/50 p-8 text-center">
      <div className="mx-auto h-12 w-12 rounded-full bg-primary-soft text-primary flex items-center justify-center">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-3 font-semibold">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">{description}</p>}
      {actionLabel && actionTo && (
        <Button asChild className="mt-4"><Link to={actionTo}>{actionLabel}</Link></Button>
      )}
    </div>
  );
}
