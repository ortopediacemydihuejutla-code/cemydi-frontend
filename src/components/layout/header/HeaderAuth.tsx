"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CircleUserRound,
  ClipboardList,
  Heart,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  Settings,
  UserRound,
} from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/providers/AuthContext";
import { logoutUser } from "@/services/auth";

export function HeaderAuthSkeleton() {
  return (
    <div
      className="inline-flex size-10 shrink-0 animate-pulse rounded-full bg-white/15"
      aria-hidden="true"
    />
  );
}

export default function HeaderAuth() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (loading) {
    return <HeaderAuthSkeleton />;
  }

  if (!user) {
    return (
      <>
        <Link
          href="/login"
          className="inline-flex h-10 items-center justify-center rounded-full border border-white/80 bg-transparent px-4 text-sm font-semibold text-white no-underline transition hover:border-white hover:bg-white/12 focus-visible:outline-2 focus-visible:outline-white"
        >
          Iniciar sesión
        </Link>
        <Link
          href="/register"
          className="inline-flex h-10 items-center justify-center rounded-full bg-white px-4 text-sm font-bold text-[#258e8b] no-underline shadow-sm transition hover:bg-[#e8f2f2] focus-visible:outline-2 focus-visible:outline-white"
        >
          Crear cuenta
        </Link>
      </>
    );
  }

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logoutUser();
    } catch {
      // Si la sesión ya expiró, igual limpiamos el estado local.
    } finally {
      logout();
      setIsLoggingOut(false);
      toast.success("Sesión cerrada correctamente");
      router.push("/login");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="size-10 shrink-0 rounded-full bg-transparent p-0 text-white shadow-none hover:bg-white/12 hover:text-white"
          aria-label="Abrir menú de cuenta"
        >
          <CircleUserRound className="size-5.5" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex flex-col gap-1">
          <span>Sesión iniciada como</span>
          <span className="truncate text-sm font-normal text-foreground">{user.correo}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {user.rol === "CLIENT" ? (
            <>
              <DropdownMenuItem asChild>
                <Link href="/mi-cuenta">
                  <LayoutDashboard aria-hidden="true" />
                  Mi cuenta
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/perfil">
                  <UserRound aria-hidden="true" />
                  Mi perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/mis-rentas">
                  <ClipboardList aria-hidden="true" />
                  Mis rentas
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/favoritos">
                  <Heart aria-hidden="true" />
                  Favoritos
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/mis-resenas">
                  <MessageSquareText aria-hidden="true" />
                  Mis reseñas
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/configuracion">
                  <Settings aria-hidden="true" />
                  Configuración
                </Link>
              </DropdownMenuItem>
            </>
          ) : null}
          {user.rol === "ADMIN" ? (
            <>
              <DropdownMenuItem asChild>
                <Link href="/perfil">
                  <UserRound aria-hidden="true" />
                  Ver perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin">
                  <LayoutDashboard aria-hidden="true" />
                  Panel Admin
                </Link>
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={isLoggingOut}
          onSelect={(event) => {
            event.preventDefault();
            void handleLogout();
          }}
        >
          <LogOut aria-hidden="true" />
          {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
