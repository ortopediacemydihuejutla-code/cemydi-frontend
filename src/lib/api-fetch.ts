import { resolveApiUrl } from "./api-config";

const CSRF_COOKIE_NAME = "cemydi_csrf";
const CSRF_HEADER_NAME = "X-CSRF-Token";

let refreshInFlight: Promise<boolean> | null = null;

export function readCsrfTokenFromDocument(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${CSRF_COOKIE_NAME}=([^;]+)`),
  );

  return match ? decodeURIComponent(match[1]) : null;
}

function isMutationMethod(method: string | undefined) {
  const normalized = (method ?? "GET").toUpperCase();
  return normalized !== "GET" && normalized !== "HEAD" && normalized !== "OPTIONS";
}

function withCsrfHeader(headers: HeadersInit | undefined): HeadersInit {
  const csrfToken = readCsrfTokenFromDocument();
  if (!csrfToken) {
    return headers ?? {};
  }

  const nextHeaders = new Headers(headers ?? {});
  if (!nextHeaders.has(CSRF_HEADER_NAME)) {
    nextHeaders.set(CSRF_HEADER_NAME, csrfToken);
  }

  return nextHeaders;
}

async function refreshSessionOnce() {
  const response = await fetch(resolveApiUrl("/auth/refresh"), {
    method: "POST",
    credentials: "include",
  });

  return response.ok;
}

export async function refreshSession() {
  if (!refreshInFlight) {
    refreshInFlight = refreshSessionOnce().finally(() => {
      refreshInFlight = null;
    });
  }

  return refreshInFlight;
}

export async function ensureCsrfCookie() {
  if (readCsrfTokenFromDocument()) {
    return true;
  }

  const response = await fetch(resolveApiUrl("/auth/csrf"), {
    method: "GET",
    credentials: "include",
  });

  return response.ok;
}

export async function apiFetch(path: string, init?: RequestInit) {
  const url = resolveApiUrl(path);
  const method = init?.method ?? "GET";

  if (isMutationMethod(method)) {
    await ensureCsrfCookie();
  }

  const requestInit: RequestInit = {
    ...(init ?? {}),
    credentials: "include",
    headers: isMutationMethod(method)
      ? withCsrfHeader(init?.headers)
      : init?.headers,
  };

  let response = await fetch(url, requestInit);

  if (response.status !== 401 || path.startsWith("/auth/refresh")) {
    return response;
  }

  const refreshed = await refreshSession();
  if (!refreshed) {
    return response;
  }

  if (isMutationMethod(method)) {
    await ensureCsrfCookie();
  }

  response = await fetch(url, {
    ...requestInit,
    headers: isMutationMethod(method)
      ? withCsrfHeader(init?.headers)
      : init?.headers,
  });
  return response;
}
