import Link from "next/link";
import type { ReactNode } from "react";
import { Check, MoveLeft } from "lucide-react";

export type AuthSplitLayoutProps = {
  children: ReactNode;
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;
};

const benefitItems = [
  "Compra y renta en un solo lugar",
  "Seguimiento claro de tus solicitudes",
  "Atención cercana cuando la necesites",
];

export function AuthSplitLayout({
  children,
  heroBadge,
  heroTitle,
  heroDescription,
}: AuthSplitLayoutProps) {
  return (
    <section className="relative isolate overflow-hidden bg-[#f8f7f3]">
      <div
        aria-hidden
        className="absolute -right-32 top-24 size-80 rounded-full bg-[#e7dfcf]/55 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-36 -left-28 size-96 rounded-full bg-[#dce9e7]/55 blur-3xl"
      />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-[1220px] items-center px-4 py-8 sm:px-8 sm:py-10 lg:px-10">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-slate-200/80 bg-white shadow-[0_30px_80px_-42px_rgba(15,23,42,0.42)] lg:grid-cols-[minmax(0,1.06fr)_minmax(440px,0.94fr)]">
        <aside className="relative hidden min-h-[720px] overflow-hidden bg-[#dfe7e5] lg:block">
          <div
            aria-hidden
            className="absolute inset-0 bg-[url('/rehabilitacion.webp')] bg-cover bg-center"
          />
          <Link
            href="/"
            className="group absolute left-7 top-7 z-10 inline-flex min-h-11 items-center gap-2 rounded-full bg-slate-950/35 px-2 pr-4 text-sm font-semibold text-white no-underline shadow-sm backdrop-blur-md transition-colors hover:bg-slate-950/50"
            aria-label="Volver al inicio"
          >
            <span className="grid size-8 place-items-center rounded-full bg-white/15 text-white transition-transform group-hover:-translate-x-0.5">
              <MoveLeft className="size-4" aria-hidden />
            </span>
            Volver al inicio
          </Link>
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,42,40,0.02)_28%,rgba(20,42,40,0.88)_100%)]"
          />

          <div className="absolute inset-x-0 bottom-0 px-8 pb-9 pt-28 text-white xl:px-10 xl:pb-10">
            <p className="m-0 text-[11px] font-bold uppercase tracking-[0.22em] text-white/75">
              {heroBadge}
            </p>
            <h2 className="mt-3 max-w-[450px] text-[2rem] font-semibold leading-[1.14] tracking-[-0.03em] text-white xl:text-[2.25rem]">
              {heroTitle}
            </h2>
            <p className="mt-3 max-w-[440px] text-sm leading-6 text-white/80 xl:text-[15px]">
              {heroDescription}
            </p>

            <ul className="m-0 mt-6 grid list-none gap-2.5 border-t border-white/20 p-0 pt-5 xl:grid-cols-2">
              {benefitItems.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-[12px] leading-5 text-white/82"
                >
                  <Check
                    className="mt-0.5 size-3.5 shrink-0 text-[#8fd7d2]"
                    strokeWidth={2.5}
                    aria-hidden
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col bg-white px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-10 xl:px-12">
          <div className="mb-7 sm:mb-8 lg:hidden">
            <Link
              href="/"
              className="group inline-flex min-h-11 items-center gap-2 rounded-full px-1 pr-3 text-sm font-semibold text-slate-600 no-underline transition-colors hover:text-slate-950"
              aria-label="Volver al inicio"
            >
              <span className="grid size-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-transform group-hover:-translate-x-0.5">
                <MoveLeft className="size-4" aria-hidden />
              </span>
              Volver al inicio
            </Link>
          </div>

          <div className="mx-auto flex w-full max-w-[470px] flex-1 flex-col justify-center">
            {children}
          </div>

          <p className="mb-0 mt-7 text-center text-[11px] text-slate-400 sm:text-left">
            © {new Date().getFullYear()} CEMYDI · Todos los derechos reservados
          </p>
        </div>
        </div>
      </div>
    </section>
  );
}
