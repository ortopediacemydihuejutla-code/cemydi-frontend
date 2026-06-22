"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import HeaderAuth from "@/components/layout/header/HeaderAuth";
import HeaderCart from "@/components/layout/header/HeaderCart";
import HeaderSearch from "@/components/layout/header/HeaderSearch";

export default function Header() {
  const pathname = usePathname();
  const shouldHideHeader = pathname.startsWith("/admin");

  if (shouldHideHeader) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 grid items-center gap-3 bg-[linear-gradient(90deg,#1e6260_0%,#2aa09d_100%)] px-4 py-[14px] lg:grid-cols-[auto_1fr_auto] lg:gap-5 lg:px-[60px] lg:py-5">
      <Link href="/" className="flex min-h-0 min-w-0 items-center no-underline">
        <Image
          src="/logo01.png"
          alt="CEMYDI"
          width={150}
          height={56}
          className="block h-auto w-[100px] object-contain"
        />
      </Link>

      <div className="flex justify-center">
        <HeaderSearch />
      </div>

      <nav className="flex flex-wrap items-center justify-center gap-4 lg:justify-end">
        <Link
          href="/catalogo"
          className="rounded-full px-[10px] py-2 font-bold text-white no-underline hover:bg-white/15"
        >
          Catálogo
        </Link>
        <Link
          href="/quienes-somos"
          className="rounded-full px-[10px] py-2 font-bold text-white no-underline hover:bg-white/15"
        >
          Quiénes somos
        </Link>
        <Link
          href="/contactanos"
          className="rounded-full px-[10px] py-2 font-bold text-white no-underline hover:bg-white/15"
        >
          Contáctanos
        </Link>
        <HeaderAuth />
        <HeaderCart />
      </nav>
    </header>
  );
}
