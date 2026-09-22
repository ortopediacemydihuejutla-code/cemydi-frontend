"use client";

import { useEffect } from "react";

import { ErrorStateShell } from "@/components/errors/ErrorStateShell";
import { reportError } from "@/lib/observability/report-error";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    reportError(error, { digest: error.digest, scope: "global-error" });
  }, [error]);

  return (
    <html lang="es">
      <body>
        <ErrorStateShell
          title="La aplicación no pudo continuar"
          description="Ocurrió un fallo general en la plataforma. Puedes intentar reanudar o dirigirte a la página principal."
          actionText="Reintentar"
          secondaryHref="/"
          secondaryText="Ir al inicio"
          error={error}
          onRetry={reset}
          fullScreen
        />
      </body>
    </html>
  );
}
