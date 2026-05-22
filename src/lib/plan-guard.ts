import { db } from "@/lib/db";
import {
  canAddStaffFromSnapshot,
  canCreateOrderFromSnapshot,
  effectiveStatusOrLimited,
  isProPlanFromSnapshot,
} from "@/lib/plan-guard-core";

export { canAddStaffFromSnapshot, canCreateOrderFromSnapshot };

export function isProPlan(subscription?: Parameters<typeof isProPlanFromSnapshot>[0]) {
  return isProPlanFromSnapshot(subscription);
}

export async function canAddStaff(storeId: string) {
  const subscription = await db.subscription.findUnique({
    where: { storeId },
  });
  const staffCount =
    subscription?.planType === "PRO" || effectiveStatusOrLimited(subscription) === "TRIALING"
      ? 0
      : await db.staffMember.count({
          where: { storeId, isActive: true },
        });

  return canAddStaffFromSnapshot(subscription, staffCount);
}

export async function canCreateOrder(storeId: string) {
  const subscription = await db.subscription.findUnique({
    where: { storeId },
  });

  const status = effectiveStatusOrLimited(subscription);
  if (status === "LIMITED" || status === "CANCELLED") {
    return {
      allowed: false,
      reason: "Langganan tidak aktif. Upgrade ke Pro.",
    };
  }

  const orderCount =
    subscription?.planType !== "PRO" && subscription?.status !== "TRIALING"
      ? await db.order.count({
          where: {
            storeId,
            createdAt: (() => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const tomorrow = new Date(today);
              tomorrow.setDate(tomorrow.getDate() + 1);
              return { gte: today, lt: tomorrow };
            })(),
            deletedAt: null,
          },
        })
      : 0;

  return canCreateOrderFromSnapshot(subscription, orderCount);
}

export async function getDateRange(storeId: string, start?: Date, end?: Date) {
  const subscription = await db.subscription.findUnique({
    where: { storeId },
  });

  const isPro = isProPlan(subscription);
  if (isPro) {
    return {
      start:
        start ?? new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      end: end ?? new Date(),
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return { start: today, end: tomorrow };
}
