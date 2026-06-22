"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/providers/AuthContext";

/**
 * No monta el chrome del panel hasta confirmar rol ADMIN; si no aplica, redirige.
 */
export function AdminRouteShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.rol !== "ADMIN") {
      router.replace("/perfil");
    }
  }, [router, user]);

  const showPanel = user?.rol === "ADMIN";

  if (!showPanel) {
    return null;
  }

  return <>{children}</>;
}
