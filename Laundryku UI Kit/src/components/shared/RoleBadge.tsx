import type { StaffRole } from "@/types/mock-schema";
import { roleLabel } from "@/lib/status-labels";
import { cn } from "@/lib/utils";

const styles: Record<StaffRole, string> = {
  ADMIN: "bg-primary-soft text-primary",
  CASHIER: "bg-info-soft text-info",
  OPERATOR: "bg-warning-soft text-warning",
  COURIER: "bg-success-soft text-success",
};

export function RoleBadge({ role, className }: { role: StaffRole; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium", styles[role], className)}>
      {roleLabel[role]}
    </span>
  );
}