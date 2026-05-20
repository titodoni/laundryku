import { db } from "@/lib/db";
import { isAfter } from "date-fns";

type SubscriptionLike = {
  planType: string;
  status: string;
  trialEndsAt: Date | null;
  nextChargeAt: Date | null;
};

/**
 * Real-time status check: treats TRIALING as LIMITED if trial has expired,
 * even before the cron job persists the change.
 */
function effectiveStatus(subscription: SubscriptionLike): string {
  if (
    subscription.status === "TRIALING" &&
    subscription.trialEndsAt &&
    isAfter(new Date(), subscription.trialEndsAt)
  ) {
    return "LIMITED";
  }
  return subscription.status;
}

function effectiveStatusOrLimited(subscription: SubscriptionLike | null): string {
  return subscription ? effectiveStatus(subscription) : "LIMITED";
}

export function isProPlan(subscription?: SubscriptionLike | null) {
  if (!subscription) return false;
  const status = effectiveStatusOrLimited(subscription);
  return subscription.planType === "PRO" && status === "ACTIVE";
}

export async function canAddStaff(storeId: string) {
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

  if (subscription?.planType !== "PRO") {
    const staffCount = await db.staffMember.count({
      where: { storeId, isActive: true },
    });
    if (staffCount >= 1) {
      return {
        allowed: false,
        reason: "Batas 1 staf untuk akun Free. Upgrade ke Pro.",
      };
    }
  }

  return { allowed: true };
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

  if (subscription?.planType !== "PRO" && subscription?.status !== "TRIALING") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const orderCount = await db.order.count({
      where: {
        storeId,
        createdAt: { gte: today, lt: tomorrow },
        deletedAt: null,
      },
    });

    if (orderCount >= 10) {
      return {
        allowed: false,
        reason: "Batas order harian tercapai. Upgrade ke Pro.",
      };
    }
  }

  return { allowed: true };
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
