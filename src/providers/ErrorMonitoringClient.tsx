"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/observability/report-error";

export function ErrorMonitoringClient() {
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      reportError(event.error ?? event.message, {
        scope: "window-error",
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      reportError(event.reason, {
        scope: "unhandled-rejection",
      });
    };

    window.addEventListener("error", handleGlobalError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
}
