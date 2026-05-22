import { Prisma } from "@prisma/client";

export const FREE_STAFF_LIMIT = 1;
export const STAFF_LOCAL_EMAIL_DOMAIN = "staff.laundryku.local";

export const staffRoleLabels: Record<"CASHIER" | "OPERATOR" | "COURIER", string> = {
  CASHIER: "Kasir",
  OPERATOR: "Operator",
  COURIER: "Kurir",
};

export const staffSummarySelect = Prisma.validator<Prisma.StaffMemberSelect>()({
  id: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  branch: {
    select: {
      id: true,
      name: true,
    },
  },
  user: {
    select: {
      id: true,
      name: true,
      phone: true,
      sessions: {
        orderBy: {
          updatedAt: "desc",
        },
        take: 1,
        select: {
          updatedAt: true,
        },
      },
    },
  },
});

export type StaffSummaryRecord = Prisma.StaffMemberGetPayload<{
  select: typeof staffSummarySelect;
}>;

export type StaffSummary = {
  id: string;
  userId: string;
  name: string;
  phone: string | null;
  role: "CASHIER" | "OPERATOR" | "COURIER";
  roleLabel: string;
  branchId: string;
  branchName: string;
  isActive: boolean;
  lastActiveAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export function serializeStaffMember(staff: StaffSummaryRecord): StaffSummary {
  return {
    id: staff.id,
    userId: staff.user.id,
    name: staff.user.name,
    phone: staff.user.phone,
    role: staff.role,
    roleLabel: staffRoleLabels[staff.role],
    branchId: staff.branch.id,
    branchName: staff.branch.name,
    isActive: staff.isActive,
    lastActiveAt: staff.user.sessions[0]?.updatedAt.toISOString() ?? null,
    createdAt: staff.createdAt.toISOString(),
    updatedAt: staff.updatedAt.toISOString(),
  };
}

export function makeStaffPlaceholderEmail(phone: string, slug: string) {
  return `${phone}.${slug}@${STAFF_LOCAL_EMAIL_DOMAIN}`;
}

export function isGeneratedStaffEmail(email: string) {
  return email.endsWith(`@${STAFF_LOCAL_EMAIL_DOMAIN}`);
}
