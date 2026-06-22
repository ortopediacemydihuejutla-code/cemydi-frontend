"use client";

import { useAuth } from "@/providers/AuthContext";

/**
 * Estado de sesión admin para UI. La protección real vive en middleware y layout.
 */
export function useAdminRouteGate() {
  const { user, loading: authLoading } = useAuth();
  const isAdmin = user?.rol === "ADMIN";

  return {
    user,
    isAdmin,
    blockingFullPage: authLoading,
  };
}
