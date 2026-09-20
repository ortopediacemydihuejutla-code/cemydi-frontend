type ReportErrorContext = {
  digest?: string;
  scope?: string;
};

const DEDUPE_WINDOW_MS = 10_000;
const recentErrorSignatures = new Map<string, number>();

function shouldDeduplicate(signature: string): boolean {
  const now = Date.now();
  const lastSeen = recentErrorSignatures.get(signature);

  if (lastSeen && now - lastSeen < DEDUPE_WINDOW_MS) {
    return true;
  }

  recentErrorSignatures.set(signature, now);

  if (recentErrorSignatures.size > 100) {
    for (const [key, timestamp] of recentErrorSignatures.entries()) {
      if (now - timestamp >= DEDUPE_WINDOW_MS) {
        recentErrorSignatures.delete(key);
      }
    }
  }

  return false;
}

function sendTelemetryBeacon(payload: {
  message: string;
  name: string;
  digest?: string;
  scope?: string;
  stack?: string;
  url?: string;
  timestamp: string;
}) {
  if (typeof window === "undefined") {
    return;
  }

  const endpoint = "/api/observability/client-error";
  const body = JSON.stringify(payload);

  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      const sent = navigator.sendBeacon(endpoint, blob);
      if (sent) return;
    }

    void fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
      cache: "no-store",
    }).catch(() => {
      // Evitar errores secundarios de telemetria
    });
  } catch {
    // Evitar errores secundarios de telemetria
  }
}

export function reportError(error: unknown, context: ReportErrorContext = {}) {
  const normalized =
    error instanceof Error
      ? error
      : new Error(typeof error === "string" ? error : "Unknown error");

  const signature = `${context.scope ?? "default"}:${normalized.name}:${normalized.message}`;

  if (shouldDeduplicate(signature)) {
    return;
  }

  if (process.env.NODE_ENV === "development") {
    console.error("[reportError]", normalized, context);
    return;
  }

  console.error("[reportError]", {
    message: normalized.message,
    name: normalized.name,
    digest: context.digest,
    scope: context.scope,
  });

  sendTelemetryBeacon({
    message: normalized.message,
    name: normalized.name,
    digest: context.digest,
    scope: context.scope,
    stack: normalized.stack?.slice(0, 1500),
    url: typeof window !== "undefined" ? window.location.href : undefined,
    timestamp: new Date().toISOString(),
  });
}
