import { apiFetch } from "@/lib/api-fetch";

export type AuthenticatedFetchInit = RequestInit;

export async function authenticatedFetch(
  path: string,
  init: AuthenticatedFetchInit = {},
): Promise<Response> {
  return apiFetch(path, {
    ...init,
    credentials: init.credentials ?? "include",
  });
}
