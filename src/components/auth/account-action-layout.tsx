import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, Check, ShieldCheck } from "lucide-react";

type AccountActionLayoutProps = {
  children: ReactNode;
  eyebrow: string;
  asideTitle: string;
  asideDescription: string;
  asideItems: string[];
};

export const accountLabelClassName =
  "mb-2 block text-[13px] font-semibold text-slate-700";
export const accountInputClassName =
  "h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#20636d] focus:bg-white focus:shadow-[0_0_0_3px_rgba(32,99,109,0.12)] disabled:cursor-not-allowed disabled:opacity-60";
export const accountPrimaryButtonClassName =
  "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#172033] bg-[#172033] px-4 text-sm font-bold text-white transition hover:border-[#24314a] hover:bg-[#24314a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20636d]/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
export const accountSecondaryButtonClassName =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20636d]/25 disabled:cursor-not-allowed disabled:opacity-60";
export const accountTextLinkClassName =
  "inline-flex items-center gap-2 text-sm font-semibold text-slate-600 no-underline transition hover:text-slate-950";

export function AccountActionLayout({
  children,
  eyebrow,
  asideTitle,
  asideDescription,
  asideItems,
}: AccountActionLayoutProps) {
  return (
    <section className="relative isolate flex min-h-[calc(100dvh-80px)] items-center overflow-hidden bg-[#f4f1eb] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div
        className="pointer-events-none absolute -top-28 -right-28 size-80 rounded-full bg-[#d7c29a]/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-24 size-96 rounded-full bg-[#20636d]/8 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto grid w-full max-w-[1040px] overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_26px_80px_-42px_rgba(15,23,42,0.48)] lg:grid-cols-[0.82fr_1.18fr]">
        <aside className="relative hidden min-h-[620px] flex-col justify-between overflow-hidden bg-[#172033] p-10 text-white lg:flex">
          <div
            className="absolute top-0 right-0 h-52 w-52 rounded-bl-full border-b border-l border-white/10 bg-white/[0.025]"
            aria-hidden
          />

          <div className="relative">
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-white no-underline"
              aria-label="Ir al inicio de CEMYDI"
            >
              <span className="grid size-9 place-items-center rounded-lg border border-white/25 text-sm font-bold">
                C
              </span>
              <span className="text-sm font-bold tracking-[0.22em]">
                CEMYDI
              </span>
            </Link>

            <div className="mt-24 max-w-[330px]">
              <p className="m-0 text-[11px] font-bold uppercase tracking-[0.2em] text-[#dfbd7d]">
                {eyebrow}
              </p>
              <h2 className="mt-4 text-[2rem] font-semibold leading-[1.18] tracking-[-0.025em] text-white">
                {asideTitle}
              </h2>
              <p className="mt-4 text-[15px] leading-7 text-slate-300">
                {asideDescription}
              </p>
            </div>
          </div>

          <div className="relative border-t border-white/10 pt-6">
            <ul className="m-0 grid list-none gap-3 p-0">
              {asideItems.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-[13px] text-slate-300"
                >
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-white/10 text-[#dfbd7d]">
                    <Check className="size-3" strokeWidth={2.5} aria-hidden />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mb-0 mt-6 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="size-4 text-[#dfbd7d]" aria-hidden />
              Tus datos se procesan de forma segura.
            </p>
          </div>
        </aside>

        <main className="flex min-h-[560px] flex-col bg-white px-5 py-7 sm:px-10 sm:py-10 lg:px-14 lg:py-12">
          <div className="mb-9 flex items-center justify-between lg:hidden">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-slate-900 no-underline"
              aria-label="Ir al inicio de CEMYDI"
            >
              <span className="grid size-8 place-items-center rounded-lg bg-[#172033] text-xs font-bold text-white">
                C
              </span>
              <span className="text-xs font-bold tracking-[0.18em]">
                CEMYDI
              </span>
            </Link>
            <Link href="/" className={accountTextLinkClassName}>
              <ArrowLeft className="size-3.5" aria-hidden />
              Inicio
            </Link>
          </div>

          <div className="mx-auto flex w-full max-w-[470px] flex-1 flex-col justify-center">
            {children}
          </div>

          <p className="mb-0 mt-9 text-center text-[11px] text-slate-400">
            © {new Date().getFullYear()} CEMYDI · Todos los derechos reservados
          </p>
        </main>
      </div>
    </section>
  );
}
