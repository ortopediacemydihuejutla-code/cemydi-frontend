import { getInternalApiUrl } from "./api-config";

export type SessionUser = {
  id: number;
  nombre: string;
  correo: string;
  activo: boolean;
  rol: "ADMIN" | "CLIENT";
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  telefono?: string | null;
  direccion?: string | null;
};

export async function fetchSessionUserFromCookieHeader(
  cookieHeader: string,
): Promise<SessionUser | null> {
  if (!cookieHeader.trim()) {
    return null;
  }

  const response = await fetch(`${getInternalApiUrl()}/users/me`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json().catch(() => null)) as
    | { user?: SessionUser }
    | null;

  return payload?.user ?? null;
}
