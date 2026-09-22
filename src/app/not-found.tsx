"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

export default function NotFound() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <main
      data-not-found
      className="flex min-h-screen items-center justify-center bg-[#f8fbfb] px-6 py-12 text-center selection:bg-[#258e8b]/15 selection:text-[#258e8b]"
    >
      <motion.div
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: shouldReduceMotion ? 0.1 : 0.35,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="flex max-w-md flex-col items-center"
      >
        <div className="select-none font-sans text-8xl font-black leading-none tracking-tight text-[#258e8b] sm:text-9xl">
          404
        </div>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl">
          Página no encontrada
        </h1>

        <p className="mt-3 max-w-[40ch] text-base leading-relaxed text-[#4b5563]">
          La ruta que buscas no existe o ya no está disponible.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#258e8b] px-6 text-sm font-semibold text-white shadow-xs transition hover:bg-[#1d7370] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#258e8b]"
          >
            Ir al inicio
          </Link>
          <Link
            href="/catalogo"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-[#cfe0e0] bg-white px-6 text-sm font-semibold text-[#258e8b] shadow-xs transition hover:border-[#258e8b] hover:bg-[#f0f9f8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#258e8b]"
          >
            Ver catálogo
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
