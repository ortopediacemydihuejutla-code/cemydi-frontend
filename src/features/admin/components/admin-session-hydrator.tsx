"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

import { useAuth } from "@/providers/AuthContext";
import type { ServerSessionUser } from "@/lib/server-session";

export function AdminSessionHydrator({ user }: { user: ServerSessionUser }) {
  const { user: contextUser, hydrateFromServer } = useAuth();
  const hydratedForUserIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (contextUser === null) {
      hydratedForUserIdRef.current = null;
    }
  }, [contextUser]);

  useLayoutEffect(() => {
    if (hydratedForUserIdRef.current === user.id) {
      return;
    }

    hydratedForUserIdRef.current = user.id;
    hydrateFromServer(user);
  }, [hydrateFromServer, user]);

  return null;
}
