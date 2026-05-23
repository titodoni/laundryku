import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export function ImportedEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; href: string } | ReactNode;
}) {
  const linkAction =
    action && typeof action === "object" && !("type" in action) && "href" in action
      ? (action as { label: string; href: string })
      : null;

  return (
    <div className="rounded-xl border border-dashed bg-card p-8 text-center shadow-soft">
      {Icon ? (
        <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
          <Icon className="h-5 w-5" />
        </div>
      ) : null}
      <h2 className="mt-3 font-display text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action ? (
        <div className="mt-4">
          {linkAction ? (
            <Button asChild className="bg-gradient-primary">
              <Link href={linkAction.href}>{linkAction.label}</Link>
            </Button>
          ) : (
            (action as ReactNode)
          )}
        </div>
      ) : null}
    </div>
  );
}
