"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

import { ErrorDetailPanel } from "@/components/errors/ErrorDetailPanel";
import { reportError } from "@/lib/observability/report-error";

type AdminErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminError({ error, reset }: AdminErrorProps) {
  useEffect(() => {
    reportError(error, { digest: error.digest, scope: "admin-error" });
  }, [error]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex min-h-[420px] w-full flex-col items-center justify-center rounded-2xl border border-[var(--border-soft)] bg-[var(--card)] p-6 text-center shadow-sm sm:p-10"
    >
      <div className="flex size-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400">
        <AlertCircle className="size-7" aria-hidden="true" />
      </div>

      <p className="mt-4 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
        Error en el panel administrativo
      </p>

      <h1 className="mt-2 text-xl font-bold text-[var(--text-main)] sm:text-2xl">
        No pudimos cargar este módulo
      </h1>

      <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--text-muted)]">
        Ocurrió un problema inesperado al procesar la solicitud del panel. Puedes
        intentar recargar la vista o volver al panel principal.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--brand-600)] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--brand-700)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Reintentar
        </button>

        <Link
          href="/admin"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[var(--border-soft)] bg-[var(--card)] px-5 text-sm font-semibold text-[var(--text-main)] no-underline shadow-sm transition hover:bg-[var(--accent-hover)] focus:outline-none"
        >
          <Home className="size-4" aria-hidden="true" />
          Ir al Dashboard
        </Link>
      </div>

      <div className="w-full max-w-2xl text-left">
        <ErrorDetailPanel error={error} />
      </div>
    </div>
  );
}
