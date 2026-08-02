"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/providers/AuthContext";
import { AdminPageLoading } from "@/features/admin/components/admin-page-loading";

/**
 * Mantiene estable el marco autorizado por el servidor mientras hidrata la sesión
 * cliente; si la sesión deja de ser válida, redirige fuera del panel.
 */
export function AdminRouteShell({
  children,
  serverAuthorized = false,
}: {
  children: ReactNode;
  serverAuthorized?: boolean;
}) {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // El layout del servidor ya validó esta petición. Durante la primera
    // hidratación el contexto todavía puede ser null durante un render; no
    // debemos convertir ese instante en una redirección visible a /login.
    if (serverAuthorized && user === null) {
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.rol !== "ADMIN") {
      router.replace("/mi-cuenta");
    }
  }, [router, serverAuthorized, user]);

  const showPanel = user?.rol === "ADMIN" || (user === null && serverAuthorized);

  if (!showPanel) {
    return <AdminPageLoading variant="dashboard" />;
  }

  return <>{children}</>;
}
