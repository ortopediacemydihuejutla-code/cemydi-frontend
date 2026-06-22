"use client";

import Link from "next/link";
import { useEffect } from "react";

import { ErrorDetailPanel } from "@/components/errors/ErrorDetailPanel";
import { reportError } from "@/lib/observability/report-error";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const shellClassName =
  "flex min-h-[calc(100vh-160px)] items-center justify-center bg-[#f8fbfb] px-5 py-12";
const wrapClassName = "w-full max-w-[720px]";
const eyebrowClassName =
  "mb-2.5 text-[0.82rem] font-bold uppercase tracking-[0.12em] text-[#1e6260]";
const titleClassName =
  "m-0 text-[clamp(2rem,4vw,3rem)] leading-[1.05] font-bold text-[#0f172a]";
const descriptionClassName =
  "mt-[18px] max-w-[58ch] text-base leading-[1.7] text-[#475569]";
const actionsClassName = "mt-7 flex flex-wrap gap-3 max-[720px]:flex-col";
const primaryButtonClassName =
  "inline-flex min-h-[46px] items-center justify-center rounded-full border-0 bg-[#0f3d3b] px-[18px] font-semibold text-white";
const secondaryLinkClassName =
  "inline-flex min-h-[46px] items-center justify-center rounded-full border border-[#cfe0e0] px-[18px] font-semibold text-[#0f3d3b] no-underline";

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    reportError(error, { digest: error.digest, scope: "app-error" });
  }, [error]);

  return (
    <section className={shellClassName} role="alert" aria-live="assertive">
      <div className={wrapClassName}>
        <p className={eyebrowClassName}>Error</p>
        <h1 className={titleClassName}>{"No pudimos cargar esta secci\u00f3n."}</h1>
        <p className={descriptionClassName}>
          {"Ocurri\u00f3 un problema inesperado. Puedes intentarlo de nuevo o volver al inicio."}
        </p>

        <div className={actionsClassName}>
          <button type="button" onClick={reset} className={primaryButtonClassName}>
            Intentar de nuevo
          </button>
          <Link href="/" className={secondaryLinkClassName}>
            Volver al inicio
          </Link>
        </div>

        <ErrorDetailPanel error={error} />
      </div>
    </section>
  );
}
