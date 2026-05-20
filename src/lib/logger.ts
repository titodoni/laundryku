type LogContext = Record<string, unknown>;

export function logInfo(message: string, context?: LogContext) {
  console.info(message, context ?? {});
}

export function logError(message: string, error: unknown, context?: LogContext) {
  console.error(message, { error, ...(context ?? {}) });
}
