"use client"

import Image from "next/image"
import Link from "next/link"

import { cn } from "@/features/admin/lib/utils"
import { useIsMobile } from "@/features/admin/hooks/use-mobile"
import { useSidebar } from "./ui/sidebar"

const BRAND_ROW_H = "h-14 min-h-14"

export function SidebarBrand() {
  const { state } = useSidebar()
  const isMobile = useIsMobile()
  const collapsed = state === "collapsed" && !isMobile

  return (
    <div
      data-sidebar="brand-slot"
      className={cn(
        "flex w-full min-w-0 shrink-0 items-stretch",
        BRAND_ROW_H,
      )}
    >
      <Link
        href="/admin"
        aria-label="CEMYDI — Ir al panel de administración"
        className={cn(
          "group flex min-h-0 min-w-0 flex-1 items-center rounded-(--radius-md) no-underline outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          collapsed
            ? "justify-center overflow-hidden px-0"
            : "min-w-0 gap-1 px-0 sm:gap-1.5",
        )}
      >
        {collapsed ? (
          <span className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden">
            <Image
              src="/logoColicionado.png"
              alt=""
              width={200}
              height={72}
              sizes="32px"
              draggable={false}
              className="block size-8 object-contain object-center select-none"
              priority
              aria-hidden
            />
          </span>
        ) : (
          <div className="-ml-1 flex w-16 max-w-16 shrink-0 justify-center">
            <span className="relative flex h-10 w-full min-w-0 max-w-full items-center justify-center overflow-hidden">
              <Image
                src="/logoOriginal.png"
                alt=""
                width={200}
                height={72}
                sizes="64px"
                draggable={false}
                className="block h-10 w-full max-h-10 object-contain object-center select-none"
                priority
                aria-hidden
              />
            </span>
          </div>
        )}

        <span
          lang="es"
          className={cn(
            "min-w-0 self-center text-left text-sm font-semibold leading-snug tracking-tight wrap-anywhere sm:text-base",
            "line-clamp-2 max-h-14",
            collapsed
              ? "pointer-events-none w-0 max-w-0 overflow-hidden p-0 opacity-0"
              : "flex-1 text-sidebar-foreground group-hover:text-primary",
          )}
        >
          Panel de administración
        </span>
      </Link>
    </div>
  )
}
