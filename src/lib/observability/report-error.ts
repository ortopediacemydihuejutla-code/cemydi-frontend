type ReportErrorContext = {
  digest?: string;
  scope?: string;
};

export function reportError(error: unknown, context: ReportErrorContext = {}) {
  const normalized =
    error instanceof Error
      ? error
      : new Error(typeof error === "string" ? error : "Unknown error");

  if (process.env.NODE_ENV === "development") {
    console.error("[reportError]", normalized, context);
    return;
  }

  // Punto de integración futuro (Sentry, Datadog, etc.)
  console.error("[reportError]", {
    message: normalized.message,
    name: normalized.name,
    digest: context.digest,
    scope: context.scope,
  });
}
