import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  fetchSessionUserFromCookieHeader,
  type SessionUser,
} from "./admin-session";

export type ServerSessionUser = SessionUser;

export async function fetchServerSessionUser(): Promise<ServerSessionUser | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  return fetchSessionUserFromCookieHeader(cookieHeader);
}

export async function requireAdminSessionUser(): Promise<ServerSessionUser> {
  const user = await fetchServerSessionUser();
  if (!user) {
    redirect("/login");
  }
  if (user.rol !== "ADMIN") {
    redirect("/perfil");
  }
  return user;
}
