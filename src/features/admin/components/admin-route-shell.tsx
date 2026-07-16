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
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.rol !== "ADMIN") {
      router.replace("/perfil");
    }
  }, [router, user]);

  const showPanel = user?.rol === "ADMIN" || (user === null && serverAuthorized);

  if (!showPanel) {
    return <AdminPageLoading layout="viewport" />;
  }

  return <>{children}</>;
}
