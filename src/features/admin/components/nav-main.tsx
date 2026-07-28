"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { ChevronRight, type LucideIcon } from "lucide-react"

import { useAuth } from "@/providers/AuthContext"
import {
  getAdminNotifications,
  type AdminNotificationCategory,
} from "@/services/admin"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from './ui/sidebar'
import { useIsMobile } from "@/features/admin/hooks/use-mobile"
import { cn, matchSidebarPath } from "@/features/admin/lib/utils"

const NOTIFICATION_CATEGORY_BY_URL: Partial<
  Record<string, AdminNotificationCategory>
> = {
  "/admin/products": "inventory",
  "/admin/rentals": "rental",
  "/admin/reviews": "review",
}

function NavNotificationBadge({
  count,
  collapsed = false,
}: {
  count: number
  collapsed?: boolean
}) {
  if (count <= 0) return null

  return (
    <span
      className={cn(
        "shrink-0 bg-[var(--brand-600)] text-white",
        collapsed
          ? "absolute top-1 right-1 size-2 rounded-full ring-2 ring-sidebar"
          : "inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-bold leading-none tabular-nums",
      )}
      aria-label={`${count} notificación${count === 1 ? "" : "es"} sin leer`}
    >
      {collapsed ? null : count > 99 ? "99+" : count}
    </span>
  )
}

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
      icon?: LucideIcon
    }[]
  }[]
}) {
  const pathname = usePathname()
  const { state } = useSidebar()
  const isMobile = useIsMobile()
  const { user } = useAuth()
  const collapsed = state === "collapsed" && !isMobile
  const notificationsQueryKey = React.useMemo(
    () => ["admin", "notifications", user?.id] as const,
    [user?.id],
  )
  const { data: notificationsData } = useQuery({
    queryKey: notificationsQueryKey,
    queryFn: () => getAdminNotifications(40),
    enabled: user?.rol === "ADMIN",
    staleTime: 10_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
  const unreadCounts = React.useMemo(() => {
    const counts: Record<AdminNotificationCategory, number> = {
      rental: 0,
      review: 0,
      inventory: 0,
      sale: 0,
    }

    for (const notification of notificationsData?.items ?? []) {
      if (notification.readAt === null) {
        counts[notification.category] += 1
      }
    }

    return counts
  }, [notificationsData?.items])
  const notificationCountForUrl = React.useCallback(
    (url: string) => {
      const category = NOTIFICATION_CATEGORY_BY_URL[url]
      return category ? unreadCounts[category] : 0
    },
    [unreadCounts],
  )

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menu</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const subItems = item.items?.length ? item.items : undefined

          if (!subItems) {
            const active =
              item.isActive ?? matchSidebarPath(pathname, item.url)
            const notificationCount = notificationCountForUrl(item.url)
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={active}
                >
                  <Link href={item.url}>
                    {item.icon && <item.icon className="size-4 shrink-0" />}
                    {!collapsed && (
                      <span className="flex-1">{item.title}</span>
                    )}
                    <NavNotificationBadge
                      count={notificationCount}
                      collapsed={collapsed}
                    />
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          return (
            <CollapsibleNavSection
              key={item.title}
              item={item}
              subItems={subItems}
              pathname={pathname}
              collapsed={collapsed}
              isMobile={isMobile}
              notificationCountForUrl={notificationCountForUrl}
            />
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

function isActiveSubItem(
  pathname: string,
  url: string,
  subItems: { url: string }[],
) {
  const bestMatch = subItems
    .filter((subItem) => matchSidebarPath(pathname, subItem.url))
    .sort((left, right) => right.url.length - left.url.length)[0]

  return bestMatch?.url === url
}

function CollapsibleNavSection({
  item,
  subItems,
  pathname,
  collapsed,
  isMobile,
  notificationCountForUrl,
}: {
  item: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
  }
  subItems: { title: string; url: string; icon?: LucideIcon }[]
  pathname: string
  collapsed: boolean
  isMobile: boolean
  notificationCountForUrl: (url: string) => number
}) {
  const childActive = subItems.some((sub) =>
    matchSidebarPath(pathname, sub.url),
  )
  const parentActive = item.isActive ?? childActive
  const sectionNotificationCount = subItems.reduce(
    (total, subItem) => total + notificationCountForUrl(subItem.url),
    0,
  )
  const [open, setOpen] = React.useState(childActive)

  React.useEffect(() => {
    if (childActive) setOpen(true)
  }, [childActive])

  if (collapsed) {
    return (
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              tooltip={item.title}
              isActive={parentActive}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {item.icon && <item.icon className="size-4 shrink-0" />}
              <NavNotificationBadge
                count={sectionNotificationCount}
                collapsed
              />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-52 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="start"
            sideOffset={8}
          >
            <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
              {item.title}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {subItems.map((subItem) => {
              const subActive = isActiveSubItem(pathname, subItem.url, subItems)
              return (
                <DropdownMenuItem key={subItem.url} asChild>
                  <Link
                    href={subItem.url}
                    className={cn(
                      subActive && "bg-accent text-accent-foreground",
                    )}
                  >
                    {subItem.icon && (
                      <subItem.icon className="size-4 shrink-0" />
                    )}
                    <span className="flex-1">{subItem.title}</span>
                    <NavNotificationBadge
                      count={notificationCountForUrl(subItem.url)}
                    />
                  </Link>
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    )
  }

  return (
    <Collapsible
      asChild
      open={open}
      onOpenChange={setOpen}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            isActive={false}
            data-section-active={parentActive}
          >
            {item.icon && <item.icon className="size-4 shrink-0" />}
            {!collapsed && (
              <>
                <span className="flex-1">{item.title}</span>
                <ChevronRight className="size-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </>
            )}
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {subItems.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarMenuSubButton
                  asChild
                  isActive={isActiveSubItem(pathname, subItem.url, subItems)}
                >
                  <Link href={subItem.url}>
                    {subItem.icon && (
                      <subItem.icon className="size-4 shrink-0" />
                    )}
                    <span className="flex-1">{subItem.title}</span>
                    <NavNotificationBadge
                      count={notificationCountForUrl(subItem.url)}
                    />
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}
