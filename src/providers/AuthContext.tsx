"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import type { AuthUser } from "@/services/auth";
import { getMyProfile } from "@/services/users";

const LEGACY_AUTH_STORAGE_KEYS = [
  "accessToken",
  "authUser",
  "user",
  "lastActivity",
  "GDPR_REMOVAL_FLAG",
] as const;

export type AuthUserProfile = AuthUser & {
  telefono?: string | null;
  direccion?: string | null;
};

type AuthContextType = {
  user: AuthUserProfile | null;
  loading: boolean;
  login: (payload: { user: AuthUserProfile }) => void;
  updateUser: (user: AuthUserProfile) => void;
  logout: () => void;
  hydrateFromServer: (user: AuthUserProfile) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const hydratedFromServerRef = useRef(false);
  const isAdminRoute = pathname.startsWith("/admin");

  useEffect(() => {
    if (isAdminRoute) {
      setLoading(false);
      return;
    }

    if (hydratedFromServerRef.current) {
      return;
    }

    let cancelled = false;

    const clearLegacyAuthStorage = () => {
      for (const key of LEGACY_AUTH_STORAGE_KEYS) {
        localStorage.removeItem(key);
      }
    };

    const hydrateAuth = async () => {
      clearLegacyAuthStorage();

      try {
        const result = await getMyProfile();
        if (cancelled) return;

        setUser(result.user);
      } catch {
        if (cancelled) return;

        clearLegacyAuthStorage();
        setUser(null);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void hydrateAuth();

    return () => {
      cancelled = true;
    };
  }, [isAdminRoute]);

  const login = useCallback(({ user: nextUser }: { user: AuthUserProfile }) => {
    hydratedFromServerRef.current = false;
    setUser(nextUser);
    setLoading(false);
  }, []);

  const updateUser = useCallback((nextUser: AuthUserProfile) => {
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    hydratedFromServerRef.current = false;
    for (const key of LEGACY_AUTH_STORAGE_KEYS) {
      localStorage.removeItem(key);
    }
    setUser(null);
    setLoading(false);
  }, []);

  const hydrateFromServer = useCallback((nextUser: AuthUserProfile) => {
    hydratedFromServerRef.current = true;
    setUser(nextUser);
    setLoading(false);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, updateUser, logout, hydrateFromServer }),
    [user, loading, login, updateUser, logout, hydrateFromServer],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
