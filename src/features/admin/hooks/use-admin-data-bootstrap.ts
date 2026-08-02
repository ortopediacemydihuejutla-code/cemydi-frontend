"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { useAuth } from "@/providers/AuthContext";

export type UseAdminDataBootstrapOptions = {
  /** Debe ser estable (p. ej. envuelto en useCallback). */
  load: () => Promise<void>;
  /** Mensaje si el error no es instancia de Error. */
  loadErrorFallback: string;
};

/**
 * Redirige a perfil si el rol no es ADMIN, ejecuta `load` para administradores
 * y expone cuándo mostrar el estado de carga inicial.
 * La protección principal de sesión vive en middleware y layout del servidor.
 */
export function useAdminDataBootstrap({
  load,
  loadErrorFallback,
}: UseAdminDataBootstrapOptions) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [initLoading, setInitLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;

    if (user.rol !== "ADMIN") {
      router.replace("/perfil");
      setInitLoading(false);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        await load();
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error instanceof Error ? error.message : loadErrorFallback,
            { id: `admin-bootstrap-${loadErrorFallback}` },
          );
        }
      } finally {
        if (!cancelled) setInitLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, router, load, loadErrorFallback]);

  const isAdmin = user?.rol === "ADMIN";

  const blockingFullPage =
    authLoading ||
    (!user && !authLoading) ||
    (!!user && !isAdmin) ||
    (isAdmin && initLoading);

  return {
    user,
    authLoading,
    initLoading,
    isAdmin,
    blockingFullPage,
  };
}
