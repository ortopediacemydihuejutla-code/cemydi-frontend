import { resolveApiUrl } from "@/lib/api-config";

export type PublicFetchInit = RequestInit & {
  next?: NextFetchRequestConfig;
};

export async function publicFetch(
  path: string,
  init: PublicFetchInit = {},
): Promise<Response> {
  const url = resolveApiUrl(path);

  return fetch(url, {
    ...init,
    credentials: init.credentials ?? "omit",
    headers: {
      Accept: "application/json",
      ...Object.fromEntries(new Headers(init.headers ?? {}).entries()),
    },
  });
}
