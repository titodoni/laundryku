import { isAfter } from "date-fns";

export type SubscriptionLike = {
  planType: string;
  status: string;
  trialEndsAt: Date | null;
  nextChargeAt?: Date | null;
};

type GuardResult = {
  allowed: boolean;
  reason?: string;
};

export function effectiveStatus(subscription: SubscriptionLike): string {
  if (
    subscription.status === "TRIALING" &&
    subscription.trialEndsAt &&
    isAfter(new Date(), subscription.trialEndsAt)
  ) {
    return "LIMITED";
  }
  return subscription.status;
}

export function effectiveStatusOrLimited(subscription: SubscriptionLike | null): string {
  return subscription ? effectiveStatus(subscription) : "LIMITED";
}

export function isProPlanFromSnapshot(subscription?: SubscriptionLike | null) {
  if (!subscription) return false;
  const status = effectiveStatusOrLimited(subscription);
  return subscription.planType === "PRO" && status === "ACTIVE";
}

export function canAddStaffFromSnapshot(
  subscription: SubscriptionLike | null | undefined,
  activeStaffCount: number,
): GuardResult {
  const status = effectiveStatusOrLimited(subscription ?? null);
  if (status === "LIMITED" || status === "CANCELLED") {
    return {
      allowed: false,
      reason: "Langganan tidak aktif. Upgrade ke Pro.",
    };
  }

  if (status === "TRIALING") {
    return { allowed: true };
  }

  if (subscription?.planType !== "PRO" && activeStaffCount >= 1) {
    return {
      allowed: false,
      reason: "Batas 1 staf untuk akun Free. Upgrade ke Pro.",
    };
  }

  return { allowed: true };
}

export function canCreateOrderFromSnapshot(
  subscription: SubscriptionLike | null | undefined,
  orderCountToday: number,
): GuardResult {
  const status = effectiveStatusOrLimited(subscription ?? null);
  if (status === "LIMITED" || status === "CANCELLED") {
    return {
      allowed: false,
      reason: "Langganan tidak aktif. Upgrade ke Pro.",
    };
  }

  if (subscription?.planType !== "PRO" && subscription?.status !== "TRIALING") {
    if (orderCountToday >= 10) {
      return {
        allowed: false,
        reason: "Batas order harian tercapai. Upgrade ke Pro.",
      };
    }
  }

  return { allowed: true };
}
