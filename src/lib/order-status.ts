export const orderLifecycleStatuses = [
  "RECEIVED",
  "PROCESS",
  "READY",
  "PICKED_UP",
  "DELIVERED",
  "CLOSED",
  "CANCELLED",
] as const;

export const legacyProcessStatuses = ["WASHING", "DRYING", "IRONING", "PACKING"] as const;

export type OrderLifecycleStatus = (typeof orderLifecycleStatuses)[number];
export type LegacyProcessStatus = (typeof legacyProcessStatuses)[number];

export const orderStatusLabels: Record<OrderLifecycleStatus, string> = {
  RECEIVED: "Baru",
  PROCESS: "Diproses",
  READY: "Siap Diambil",
  PICKED_UP: "Diambil",
  DELIVERED: "Diantar",
  CLOSED: "Ditutup",
  CANCELLED: "Dibatalkan",
};

export const orderTransitionMap: Record<OrderLifecycleStatus, OrderLifecycleStatus[]> = {
  RECEIVED: ["PROCESS", "CANCELLED"],
  PROCESS: ["READY", "CANCELLED"],
  READY: ["PICKED_UP", "DELIVERED"],
  PICKED_UP: ["CLOSED"],
  DELIVERED: ["CLOSED"],
  CLOSED: [],
  CANCELLED: [],
};

export const terminalOrderStatuses = ["CLOSED", "CANCELLED"] as const;
export const nonCancellableOrderStatuses = ["PICKED_UP", "DELIVERED", "CLOSED", "CANCELLED"] as const;

export function isLegacyProcessStatus(status: string): status is LegacyProcessStatus {
  return legacyProcessStatuses.includes(status as LegacyProcessStatus);
}

export function isOrderLifecycleStatus(status: string): status is OrderLifecycleStatus {
  return orderLifecycleStatuses.includes(status as OrderLifecycleStatus);
}

export function normalizeOrderStatus(status: string): OrderLifecycleStatus {
  if (isLegacyProcessStatus(status)) {
    return "PROCESS";
  }

  if (isOrderLifecycleStatus(status)) {
    return status;
  }

  return "RECEIVED";
}

export function formatOrderStatusDebugLabel(status: string) {
  const normalizedStatus = normalizeOrderStatus(status);
  return `${orderStatusLabels[normalizedStatus]} (${normalizedStatus})`;
}

export function isNonCancellableOrderStatus(status: string) {
  return nonCancellableOrderStatuses.includes(normalizeOrderStatus(status) as (typeof nonCancellableOrderStatuses)[number]);
}

export function isTerminalOrderStatus(status: string) {
  return terminalOrderStatuses.includes(normalizeOrderStatus(status) as (typeof terminalOrderStatuses)[number]);
}
