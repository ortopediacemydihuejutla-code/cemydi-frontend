import type { ReactNode } from "react";

export type AuthSplitLayoutProps = {
  children: ReactNode;
  heroTitle: string;
  heroBadge?: string;
  heroDescription?: string;
  heroItems?: readonly string[];
  heroStats?: readonly unknown[];
  variant?: string;
};

export function AuthSplitLayout({
  children,
  heroTitle,
}: AuthSplitLayoutProps) {
  return (
    <section className="relative flex min-h-[calc(100dvh-5.25rem)] w-full flex-1 flex-col bg-white lg:h-[calc(100dvh-5.25rem)] lg:overflow-hidden">
      <div className="flex h-full min-h-0 w-full flex-1 flex-col lg:flex-row">
        {/* Columna izquierda: Imagen con blur bajo y texto único en blanco centrado en medio */}
        <div className="relative hidden items-center justify-center overflow-hidden border-r border-slate-200 bg-[#0c3634] p-8 lg:flex lg:w-1/2 lg:p-12 xl:p-16 text-white">
          {/* Imagen de fondo generada por IA con blur bajo */}
          <div
            className="absolute inset-0 bg-cover bg-top blur-[2px] scale-105"
            style={{ backgroundImage: "url('/auth_hero.jpg')" }}
            role="img"
            aria-label="CEMYDI Clínica Ortopédica y Rehabilitación"
          />
          {/* Velo sutil homogéneo para permitir excelente legibilidad del texto en el centro */}
          <div
            className="absolute inset-0 bg-[#061e1c]/45"
            aria-hidden="true"
          />

          {/* Un solo texto en blanco en medio de la imagen */}
          <div className="relative z-10 mx-auto max-w-lg text-center px-4">
            <h2 className="text-2xl sm:text-3xl xl:text-[2.2rem] font-light leading-snug tracking-tight text-white drop-shadow-md">
              &ldquo;{heroTitle}&rdquo;
            </h2>
          </div>
        </div>

        {/* Columna derecha: Formulario centrado ajustado al viewport */}
        <div className="flex w-full flex-1 flex-col items-center justify-center overflow-y-auto bg-white px-6 py-4 sm:px-8 sm:py-5 lg:w-1/2 lg:px-10 lg:py-4 xl:px-14">
          <div className="my-auto w-full max-w-[460px]">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
