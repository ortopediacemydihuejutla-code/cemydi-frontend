"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Suspense, useState } from "react";
import HeaderAuth from "@/components/layout/header/HeaderAuth";
import HeaderCart from "@/components/layout/header/HeaderCart";
import HeaderSearch, {
  HeaderSearchSkeleton,
} from "@/components/layout/header/HeaderSearch";

const NAV_LINKS = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/quienes-somos", label: "Quiénes somos" },
  { href: "/contactanos", label: "Contáctanos" },
] as const;

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuState, setMobileMenuState] = useState({
    pathname,
    open: false,
  });
  const shouldHideHeader = pathname.startsWith("/admin");
  const isMobileMenuOpen =
    mobileMenuState.pathname === pathname && mobileMenuState.open;

  if (shouldHideHeader) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-[linear-gradient(90deg,#1e6260_0%,#2aa09d_100%)] px-4 py-3 shadow-[0_10px_30px_rgba(15,61,59,0.16)] lg:grid lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-5 lg:px-[3.75rem] lg:py-5 lg:shadow-none">
      <div className="flex items-center justify-between gap-3 lg:contents">
        <Link href="/" className="flex min-h-0 min-w-0 items-center no-underline">
          <Image
            src="/logo01.png"
            alt="CEMYDI"
            width={150}
            height={56}
            priority
            className="block h-auto w-[6rem] object-contain sm:w-[6.75rem]"
          />
        </Link>

        <div className="flex shrink-0 items-center gap-1.5 lg:hidden">
          <HeaderCart />
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition hover:bg-white/18"
            aria-controls="mobile-header-menu"
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            onClick={() =>
              setMobileMenuState((current) => ({
                pathname,
                open:
                  current.pathname === pathname ? !current.open : true,
              }))
            }
          >
            {isMobileMenuOpen ? (
              <X className="size-6" aria-hidden="true" />
            ) : (
              <Menu className="size-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <div className="hidden justify-center lg:flex">
        <Suspense fallback={<HeaderSearchSkeleton />}>
          <HeaderSearch inputId="header-search-desktop" />
        </Suspense>
      </div>

      <nav className="hidden items-center justify-end gap-3 lg:flex">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full px-[0.625rem] py-2 font-bold text-white no-underline hover:bg-white/15"
          >
            {link.label}
          </Link>
        ))}
        <HeaderAuth />
        <HeaderCart />
      </nav>

      {isMobileMenuOpen ? (
        <div id="mobile-header-menu" className="mt-3 lg:hidden">
          <div className="border-t border-white/18 pt-3">
            <Suspense fallback={<HeaderSearchSkeleton />}>
              <HeaderSearch inputId="header-search-mobile" />
            </Suspense>

            <nav className="mt-3 flex flex-col gap-1.5">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex min-h-11 items-center rounded-2xl px-3 font-bold text-white no-underline hover:bg-white/12"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-3 flex flex-col gap-2 border-t border-white/18 pt-3 [&_a]:w-full [&_a]:justify-center">
              <HeaderAuth />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
