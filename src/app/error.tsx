"use client";

import { useEffect } from "react";

import { ErrorStateShell } from "@/components/errors/ErrorStateShell";
import { reportError } from "@/lib/observability/report-error";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    reportError(error, { digest: error.digest, scope: "app-error" });
  }, [error]);

  return (
    <ErrorStateShell
      title="No pudimos cargar esta sección"
      description="Ocurrió un problema inesperado al procesar la información. Puedes intentar recargar o volver al inicio."
      actionText="Intentar de nuevo"
      secondaryHref="/"
      secondaryText="Volver al inicio"
      error={error}
      onRetry={reset}
    />
  );
}
