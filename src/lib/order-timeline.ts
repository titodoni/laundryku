import { formatOrderStatusDebugLabel, normalizeOrderStatus, type OrderLifecycleStatus } from "@/lib/order-status";

type ActivityLogSummary = {
  action: string;
  createdAt: Date;
  details: unknown;
};

type TimelineStageState = "completed" | "current" | "upcoming";

export type OrderTimelineEntry = {
  key: "CREATED" | "PROCESS" | "READY" | "HANDOFF" | "CLOSED" | "CANCELLED";
  label: string;
  debugLabel: string;
  state: TimelineStageState;
  occurredAt: string | null;
};

type BuildOrderTimelineInput = {
  status: string;
  createdAt: Date;
  updatedAt: Date;
  estimatedReadyAt?: Date | null;
  completedAt?: Date | null;
  cancelledAt?: Date | null;
  activityLogs?: ActivityLogSummary[];
};

function getDetailValue(details: unknown, key: string) {
  if (!details || typeof details !== "object" || Array.isArray(details)) {
    return null;
  }

  const value = (details as Record<string, unknown>)[key];
  return typeof value === "string" ? value : null;
}

function getFirstStatusTimestamp(logs: ActivityLogSummary[], statuses: string[]) {
  const wanted = new Set(statuses.map((status) => normalizeOrderStatus(status)));

  for (const log of logs) {
    if (log.action !== "order.status_changed") {
      continue;
    }

    const nextStatus = getDetailValue(log.details, "nextStatus");
    if (!nextStatus) {
      continue;
    }

    if (wanted.has(normalizeOrderStatus(nextStatus))) {
      return log.createdAt;
    }
  }

  return null;
}

function getStatusBeforeClosed(logs: ActivityLogSummary[]) {
  for (const log of logs) {
    if (log.action !== "order.status_changed") {
      continue;
    }

    const nextStatus = getDetailValue(log.details, "nextStatus");
    if (normalizeOrderStatus(nextStatus ?? "") !== "CLOSED") {
      continue;
    }

    const previousStatus = getDetailValue(log.details, "previousStatus");
    const normalizedPrevious = normalizeOrderStatus(previousStatus ?? "");
    if (normalizedPrevious === "PICKED_UP" || normalizedPrevious === "DELIVERED") {
      return normalizedPrevious;
    }
  }

  return null;
}

function toIsoString(value: Date | null) {
  return value ? value.toISOString() : null;
}

function getCurrentStage(status: OrderLifecycleStatus) {
  switch (status) {
    case "RECEIVED":
      return "CREATED";
    case "PROCESS":
      return "PROCESS";
    case "READY":
      return "READY";
    case "PICKED_UP":
    case "DELIVERED":
      return "HANDOFF";
    case "CLOSED":
      return "CLOSED";
    case "CANCELLED":
      return "CANCELLED";
    default:
      return "CREATED";
  }
}

export function buildOrderTimeline(input: BuildOrderTimelineInput): OrderTimelineEntry[] {
  const normalizedStatus = normalizeOrderStatus(input.status);
  const logs = [...(input.activityLogs ?? [])].sort(
    (left, right) => left.createdAt.getTime() - right.createdAt.getTime(),
  );

  const createdAt = logs.find((log) => log.action === "order.created")?.createdAt ?? input.createdAt;
  const processAt =
    getFirstStatusTimestamp(logs, ["PROCESS", "WASHING", "DRYING", "IRONING", "PACKING"]) ??
    (["PROCESS", "READY", "PICKED_UP", "DELIVERED", "CLOSED"].includes(normalizedStatus) ? input.createdAt : null);
  const readyAt =
    getFirstStatusTimestamp(logs, ["READY"]) ??
    (["READY", "PICKED_UP", "DELIVERED", "CLOSED"].includes(normalizedStatus)
      ? input.estimatedReadyAt ?? input.completedAt ?? input.updatedAt
      : null);
  const handoffStatusFromLogs = getFirstStatusTimestamp(logs, ["DELIVERED"])
    ? "DELIVERED"
    : getFirstStatusTimestamp(logs, ["PICKED_UP"])
      ? "PICKED_UP"
      : null;
  const handoffStatus =
    normalizedStatus === "PICKED_UP" || normalizedStatus === "DELIVERED"
      ? normalizedStatus
      : normalizedStatus === "CLOSED"
        ? getStatusBeforeClosed(logs) ?? handoffStatusFromLogs
        : handoffStatusFromLogs;
  const handoffAt =
    getFirstStatusTimestamp(logs, ["PICKED_UP", "DELIVERED"]) ??
    (handoffStatus ? input.completedAt ?? input.updatedAt : null);
  const closedAt =
    getFirstStatusTimestamp(logs, ["CLOSED"]) ?? (normalizedStatus === "CLOSED" ? input.updatedAt : null);
  const cancelledAt =
    getFirstStatusTimestamp(logs, ["CANCELLED"]) ??
    (normalizedStatus === "CANCELLED" ? input.cancelledAt ?? input.updatedAt : null);

  const handoffLabel = handoffStatus === "DELIVERED" ? "Diantar" : "Diambil";
  const handoffDebugLabel =
    handoffStatus === "DELIVERED" ? "Diantar (DELIVERED)" : "Diambil (PICKED_UP)";

  const regularEntries: OrderTimelineEntry[] = [
    {
      key: "CREATED",
      label: "Pesanan dibuat",
      debugLabel: "Pesanan dibuat (RECEIVED)",
      state: "upcoming",
      occurredAt: toIsoString(createdAt),
    },
    {
      key: "PROCESS",
      label: "Diproses",
      debugLabel: formatOrderStatusDebugLabel("PROCESS"),
      state: "upcoming",
      occurredAt: toIsoString(processAt),
    },
    {
      key: "READY",
      label: "Siap diambil",
      debugLabel: formatOrderStatusDebugLabel("READY"),
      state: "upcoming",
      occurredAt: toIsoString(readyAt),
    },
    {
      key: "HANDOFF",
      label: handoffLabel,
      debugLabel: handoffDebugLabel,
      state: "upcoming",
      occurredAt: toIsoString(handoffAt),
    },
    {
      key: "CLOSED",
      label: "Ditutup",
      debugLabel: formatOrderStatusDebugLabel("CLOSED"),
      state: "upcoming",
      occurredAt: toIsoString(closedAt),
    },
  ];

  if (normalizedStatus === "CANCELLED") {
    const completedEntries = regularEntries.filter((entry) => entry.occurredAt);
    return [
      ...completedEntries.map((entry) => ({ ...entry, state: "completed" as const })),
      {
        key: "CANCELLED",
        label: "Dibatalkan",
        debugLabel: formatOrderStatusDebugLabel("CANCELLED"),
        state: "current",
        occurredAt: toIsoString(cancelledAt),
      },
    ];
  }

  const flow = ["CREATED", "PROCESS", "READY", "HANDOFF", "CLOSED"] as const;
  const currentStage = getCurrentStage(normalizedStatus);
  const currentIndex = flow.indexOf(currentStage as (typeof flow)[number]);

  return regularEntries.map((entry, index) => ({
    ...entry,
    state: index < currentIndex ? "completed" : index === currentIndex ? "current" : "upcoming",
  }));
}
