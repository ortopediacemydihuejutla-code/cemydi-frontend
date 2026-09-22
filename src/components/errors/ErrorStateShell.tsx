"use client";

import Link from "next/link";
import * as React from "react";

import { ErrorDetailPanel } from "@/components/errors/ErrorDetailPanel";

type ErrorStateShellProps = {
  title: string;
  description: string;
  actionText?: string;
  secondaryHref?: string;
  secondaryText?: string;
  error: Error & { digest?: string };
  onRetry?: () => void;
  fullScreen?: boolean;
};

export function ErrorStateShell({
  title,
  description,
  actionText = "Intentar de nuevo",
  secondaryHref = "/",
  secondaryText = "Volver al inicio",
  error,
  onRetry,
  fullScreen = false,
}: ErrorStateShellProps) {
  return (
    <section
      role="alert"
      aria-live="assertive"
      className={`flex items-center justify-center bg-[#f8fbfb] px-6 py-12 text-center selection:bg-[#258e8b]/15 selection:text-[#258e8b] ${
        fullScreen ? "min-h-screen" : "min-h-[calc(100vh-160px)]"
      }`}
    >
      <div className="flex w-full max-w-lg flex-col items-center">
        <h1 className="text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl">
          {title}
        </h1>
        <p className="mt-3 max-w-[44ch] text-base leading-relaxed text-[#4b5563]">
          {description}
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[#258e8b] px-6 text-sm font-semibold text-white shadow-xs transition hover:bg-[#1d7370] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#258e8b]"
            >
              {actionText}
            </button>
          ) : null}

          {secondaryHref ? (
            <Link
              href={secondaryHref}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-[#cfe0e0] bg-white px-6 text-sm font-semibold text-[#258e8b] shadow-xs transition hover:border-[#258e8b] hover:bg-[#f0f9f8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#258e8b]"
            >
              {secondaryText}
            </Link>
          ) : null}
        </div>

        <div className="mt-6 w-full text-left">
          <ErrorDetailPanel error={error} />
        </div>
      </div>
    </section>
  );
}
