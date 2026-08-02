"use client";

import {
  CircleAlert,
  CircleHelp,
  ClipboardList,
  Heart,
  Home,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  MessageSquareText,
  PackageSearch,
  Settings,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { useIsMobile } from "@/features/admin/hooks/use-mobile";
import { cn } from "@/features/admin/lib/utils";
import { AdminUserAvatar } from "@/features/admin/components/admin-user-avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/features/admin/components/ui/sidebar";
import { useAuth } from "@/providers/AuthContext";
import { isProfileComplete } from "@/lib/profile-completion";
import { logoutUser } from "@/services/auth";

const accountNavigation = [
  { title: "Resumen", url: "/mi-cuenta", icon: Home },
  { title: "Información personal", url: "/perfil", icon: UserRound },
  { title: "Mis pedidos", url: "/mis-pedidos", icon: PackageSearch },
  { title: "Mis rentas", url: "/mis-rentas", icon: ClipboardList },
  { title: "Mis favoritos", url: "/favoritos", icon: Heart },
  { title: "Mis reseñas", url: "/mis-resenas", icon: MessageSquareText },
  { title: "Configuración", url: "/configuracion", icon: Settings },
] as const;

function AccountNavigation() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isMobile = useIsMobile();
  const collapsed = state === "collapsed" && !isMobile;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menu</SidebarGroupLabel>
      <SidebarMenu>
        {accountNavigation.map((item) => {
          const active =
            pathname === item.url || pathname.startsWith(`${item.url}/`);

          return (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={active}
              >
                <Link
                  href={item.url}
                  aria-current={active ? "page" : undefined}
                >
                  <item.icon className="size-4 shrink-0" />
                  {!collapsed ? <span>{item.title}</span> : null}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function initialsFromName(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  );
}

function AccountSidebarIdentity() {
  const { user } = useAuth();
  const { state } = useSidebar();
  const isMobile = useIsMobile();
  const collapsed = state === "collapsed" && !isMobile;
  const displayName = user?.nombre?.trim() || "Mi cuenta";
  const displayEmail = user?.correo?.trim() || "—";
  const initials = initialsFromName(displayName);

  return (
    <div
      data-sidebar="account-identity"
      className={cn(
        "flex w-full min-w-0 shrink-0 items-center border-b border-sidebar-border",
        collapsed
          ? "min-h-[6.25rem] flex-col justify-center gap-2 px-1 py-3"
          : "min-h-[4.75rem] gap-2.5 px-2 py-3",
      )}
    >
      <Link
        href="/perfil"
        aria-label={`Ver perfil de ${displayName}`}
        className={cn(
          "flex min-w-0 items-center rounded-lg no-underline outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
          collapsed ? "justify-center" : "flex-1 gap-2.5",
        )}
      >
        <AdminUserAvatar
          initials={initials}
          className="size-9 shrink-0"
          fallbackClassName="text-xs"
        />
        {!collapsed ? (
          <span className="grid min-w-0 flex-1 text-left leading-tight">
            <span className="truncate text-sm font-bold text-[#0f3d3b]">
              {displayName}
            </span>
            <span className="mt-1 truncate text-xs text-[#6b7e86]">
              {displayEmail}
            </span>
          </span>
        ) : null}
      </Link>
      <SidebarTrigger
        className={cn(
          "shrink-0 rounded-lg border border-[#d7e4e4] bg-white text-[#1f6a67] shadow-sm hover:bg-[#edf7f6] hover:text-[#154f4d]",
          collapsed ? "size-8" : "size-9",
        )}
        aria-label={
          isMobile
            ? "Cerrar el menú de Mi cuenta"
            : collapsed
              ? "Expandir el menú de Mi cuenta"
              : "Contraer el menú de Mi cuenta"
        }
      />
    </div>
  );
}

function AccountQuickLinks() {
  const { user } = useAuth();
  const { state } = useSidebar();
  const isMobile = useIsMobile();
  const collapsed = state === "collapsed" && !isMobile;
  const profileComplete = isProfileComplete(user);

  const links = [
    profileComplete
      ? { title: "Ir al catálogo", url: "/catalogo", icon: ShoppingBag }
      : {
          title: "Completar perfil",
          url: "/perfil?completar=1",
          icon: CircleAlert,
        },
    { title: "Ayuda", url: "/contactanos", icon: CircleHelp },
    ...(user?.rol === "ADMIN"
      ? [
          {
            title: "Panel administrativo",
            url: "/admin",
            icon: LayoutDashboard,
          },
        ]
      : []),
  ];

  return (
    <SidebarGroup className="border-t border-sidebar-border">
      <SidebarGroupLabel>Accesos</SidebarGroupLabel>
      <SidebarMenu>
        {links.map((item) => (
          <SidebarMenuItem key={item.url}>
            <SidebarMenuButton asChild tooltip={item.title}>
              <Link href={item.url}>
                <item.icon className="size-4 shrink-0" />
                {!collapsed ? <span>{item.title}</span> : null}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function AccountLogout() {
  const { logout } = useAuth();
  const router = useRouter();
  const { state } = useSidebar();
  const isMobile = useIsMobile();
  const collapsed = state === "collapsed" && !isMobile;
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logoutUser();
    } catch {
      // La limpieza local permite salir aunque la sesión ya haya expirado.
    } finally {
      logout();
      router.push("/login");
      setIsLoggingOut(false);
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          type="button"
          size="lg"
          tooltip="Cerrar sesión"
          aria-label="Cerrar sesión"
          disabled={isLoggingOut}
          onClick={() => void handleLogout()}
          className={cn(
            "border border-[#b91c1c] !bg-[#dc2626] font-semibold !text-white shadow-[0_7px_16px_rgba(220,38,38,0.22)] hover:!border-[#991b1b] hover:!bg-[#b91c1c] hover:!text-white focus-visible:ring-[#ef4444]",
            collapsed &&
              "mx-auto! h-10! min-h-10! w-10! min-w-10! max-w-10! justify-center px-0!",
          )}
        >
          {isLoggingOut ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <LogOut className="size-4" aria-hidden="true" />
          )}
          {!collapsed ? (
            <span>{isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}</span>
          ) : null}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function CustomerAccountSidebar(
  props: React.ComponentProps<typeof Sidebar>,
) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="min-w-0 p-0!">
        <AccountSidebarIdentity />
      </SidebarHeader>
      <SidebarContent>
        <AccountNavigation />
        <AccountQuickLinks />
      </SidebarContent>
      <SidebarFooter className="pb-16">
        <AccountLogout />
      </SidebarFooter>
    </Sidebar>
  );
}
