"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import HeaderTopBar from "@/components/layout/header/HeaderTopBar";
import { Suspense, useEffect, useState } from "react";
import HeaderAuth from "@/components/layout/header/HeaderAuth";
import HeaderCart from "@/components/layout/header/HeaderCart";
import HeaderSearch, {
  HeaderSearchSkeleton,
} from "@/components/layout/header/HeaderSearch";
import { cn } from "@/lib/utils";

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
  const [isScrolledDown, setIsScrolledDown] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          if (currentScrollY <= 20) {
            setIsScrolledDown(false);
          } else if (currentScrollY > lastScrollY + 6 && currentScrollY > 60) {
            setIsScrolledDown(true);
          } else if (currentScrollY < lastScrollY - 6) {
            setIsScrolledDown(false);
          }
          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const shouldHideHeader = pathname.startsWith("/admin");
  const isMobileMenuOpen =
    mobileMenuState.pathname === pathname && mobileMenuState.open;
  const isTopBarHidden = isScrolledDown && !isMobileMenuOpen;

  if (shouldHideHeader) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 overflow-hidden bg-[#258e8b]">
      <HeaderTopBar isHidden={isTopBarHidden} />
      <div
        className={cn(
          "overflow-hidden bg-[#258e8b] px-4 py-3.5 shadow-[0_4px_20px_rgba(15,61,59,0.12)] lg:grid lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-5 xl:gap-6 lg:px-10 xl:px-14 lg:py-5 lg:shadow-none",
        )}
      >
        <div className="flex items-center justify-between gap-3 lg:contents">
          <Link
            href="/"
            className="flex min-h-0 min-w-0 items-center no-underline transition-opacity hover:opacity-90"
          >
            <Image
              src="/logo-horizontal-white.png"
              alt="CEMYDI"
              width={160}
              height={48}
              priority
              className="block h-9.5 w-auto object-contain sm:h-10 lg:h-11"
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
                  open: current.pathname === pathname ? !current.open : true,
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

        <nav className="hidden items-center justify-end gap-1.5 xl:gap-2 lg:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "group relative inline-flex h-10 items-center justify-center px-3.5 text-sm font-semibold no-underline transition-colors duration-200",
                  isActive
                    ? "text-white font-bold"
                    : "text-white/85 hover:text-white",
                )}
              >
                <span>{link.label}</span>
                <span
                  className={cn(
                    "absolute bottom-1.5 left-3.5 right-3.5 h-0.5 rounded-full bg-white transition-all duration-300 ease-out origin-center motion-reduce:transition-none",
                    isActive
                      ? "scale-x-100 opacity-100"
                      : "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100",
                  )}
                  aria-hidden="true"
                />
              </Link>
            );
          })}
          <div
            className="mx-1 h-5 w-px shrink-0 bg-white/25"
            aria-hidden="true"
          />
          <HeaderAuth />
          <HeaderCart />
        </nav>

        {isMobileMenuOpen ? (
          <div id="mobile-header-menu" className="mt-3 lg:hidden">
            <div className="border-t border-white/18 pt-3">
              <Suspense fallback={<HeaderSearchSkeleton />}>
                <HeaderSearch inputId="header-search-mobile" />
              </Suspense>

              <nav className="mt-3 flex flex-col gap-1">
                {NAV_LINKS.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "flex min-h-10 items-center rounded-xl px-3.5 text-sm font-semibold text-white no-underline transition-colors hover:bg-white/12",
                        isActive && "bg-white/20 font-bold",
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-3 flex flex-col gap-2 border-t border-white/18 pt-3 [&_a]:w-full [&_a]:justify-center">
                <HeaderAuth />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
