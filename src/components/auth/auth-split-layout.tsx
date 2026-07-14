import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export type AuthSplitLayoutProps = {
  children: ReactNode;
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;
};

export function AuthSplitLayout({
  children,
  heroBadge,
  heroTitle,
  heroDescription,
}: AuthSplitLayoutProps) {
  return (
    /* Fondo de pantalla completa */
    <div className="flex min-h-[calc(100dvh-80px)] items-center justify-center bg-[#eef6f5] p-4 sm:p-6 lg:p-8">

      {/* ── Card principal ── */}
      <div className="relative z-10 w-full max-w-[960px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_70px_-28px_rgba(15,23,42,0.75),0_0_0_1px_rgba(15,23,42,0.06)]">
        <div className="grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">

          {/* ── Columna izquierda: hero ── */}
          <div className="relative hidden flex-col overflow-hidden bg-slate-900 lg:flex lg:min-h-[650px]">
            {/* Foto de fondo */}
            <div
              className="absolute inset-0 bg-[url('/fondowan.png')] bg-cover bg-center"
              aria-hidden
            />
            {/* Gradiente oscuro para legibilidad */}
            <div
              className="absolute inset-0 bg-linear-to-t from-[#071e1d]/95 via-[#0f3a38]/55 to-transparent"
              aria-hidden
            />
            {/* Degradado lateral derecho para fusionar con el formulario */}
            <div
              className="absolute inset-0 bg-linear-to-r from-transparent via-transparent to-[#0d3b39]/30"
              aria-hidden
            />

            {/* Logo arriba */}
            <div className="relative z-10 p-8">
              <Link href="/">
                <Image
                  src="/logo01.png"
                  alt="CEMYDI"
                  width={130}
                  height={48}
                  className="h-8 w-auto object-contain brightness-0 invert sm:h-9"
                  priority
                />
              </Link>
            </div>

            {/* Espaciador para móvil (la foto se ve como banner) */}
            <div className="relative z-10 hidden flex-1 lg:block" />

            {/* Texto de marca abajo */}
            <div className="relative z-10 p-8">
              <div className="mb-3 h-[2px] w-8 rounded-full bg-[#4ecdc4]" />
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#4ecdc4]">
                {heroBadge}
              </p>
              <h2 className="mb-2 text-xl font-bold leading-snug text-white sm:text-2xl">
                {heroTitle}
              </h2>
              <p className="text-[13px] leading-relaxed text-white/70">
                {heroDescription}
              </p>

              {/* Estadísticas */}
              <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-5">
                <div>
                  <p className="text-base font-bold text-white">+15</p>
                  <p className="text-[10px] text-white/55">Años</p>
                </div>
                <div>
                  <p className="text-base font-bold text-white">1,200+</p>
                  <p className="text-[10px] text-white/55">Pacientes</p>
                </div>
                <div>
                  <p className="text-base font-bold text-white">98%</p>
                  <p className="text-[10px] text-white/55">Satisfacción</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Columna derecha: formulario ── */}
          <div className="flex flex-col bg-white px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-10">
            <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col justify-center">
              {/* Logo para móvil (la columna izquierda se oculta en sm) */}
              <div className="mb-6 lg:hidden">
                <Link href="/">
                  <Image
                    src="/logoOriginal.png"
                    alt="CEMYDI"
                    width={120}
                    height={44}
                    className="h-8 w-auto object-contain"
                    priority
                  />
                </Link>
              </div>

              {children}
            </div>

            {/* Copyright dentro de la card */}
            <p className="mt-5 text-center text-[11px] text-slate-300">
              © {new Date().getFullYear()} CEMYDI · Todos los derechos reservados
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
