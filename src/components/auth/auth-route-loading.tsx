"use client";

import { LoaderCircle } from "lucide-react";

type AuthRouteLoadingProps = {
  title?: string;
  description?: string;
};

export function AuthRouteLoading({
  title = "Cargando cuenta",
  description = "Preparando tu acceso...",
}: AuthRouteLoadingProps) {
  return (
    <section className="flex min-h-[calc(100dvh-160px)] items-center justify-center bg-[#f8fbfb] px-5 py-12">
      <div
        className="grid w-full max-w-sm justify-items-center gap-4 rounded-2xl border border-[#dce8e8] bg-white px-6 py-8 text-center shadow-[0_18px_50px_rgba(15,61,59,0.10)]"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="grid size-14 place-items-center rounded-full bg-[#258e8b]/10 text-[#258e8b]">
          <LoaderCircle className="size-7 animate-spin" aria-hidden="true" />
        </div>
        <div className="grid gap-1">
          <p className="m-0 text-base font-bold text-[#18313f]">{title}</p>
          <p className="m-0 text-sm leading-6 text-[#647980]">{description}</p>
        </div>
        <span className="sr-only">{title}</span>
      </div>
    </section>
  );
}
