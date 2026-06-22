"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleUserRound, LayoutDashboard, LogOut, UserRound } from "lucide-react";
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
    <div className="flex items-center gap-3" aria-hidden="true">
      <span className="inline-block h-9 w-24 animate-pulse rounded-full bg-white/20" />
      <span className="inline-block size-6 animate-pulse bg-white/25" />
    </div>
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
          className="rounded-full border-2 border-white px-[22px] py-2.5 font-bold text-white no-underline hover:bg-white/10"
        >
          Iniciar sesión
        </Link>
        <Link
          href="/register"
          className="rounded-full bg-white px-[22px] py-2.5 font-extrabold text-[#1e6260] no-underline shadow-[0_4px_12px_rgba(0,0,0,0.2)] transition-transform hover:-translate-y-px"
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
          className="size-auto rounded-none bg-transparent p-0 text-white shadow-none hover:bg-transparent hover:text-white/80"
          aria-label="Abrir menú de cuenta"
        >
          <CircleUserRound className="size-6" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex flex-col gap-1">
          <span>Sesión iniciada como</span>
          <span className="truncate text-sm font-normal text-foreground">{user.correo}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/perfil">
              <UserRound aria-hidden="true" />
              Mi perfil
            </Link>
          </DropdownMenuItem>
          {user.rol === "ADMIN" ? (
            <DropdownMenuItem asChild>
              <Link href="/admin">
                <LayoutDashboard aria-hidden="true" />
                Panel Admin
              </Link>
            </DropdownMenuItem>
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
