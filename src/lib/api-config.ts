const DEFAULT_PUBLIC_API_URL = "/api";
const DEFAULT_INTERNAL_API_URL = "http://localhost:4000";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.trim() || DEFAULT_PUBLIC_API_URL;

export function getInternalApiUrl() {
  const explicitInternal = process.env.INTERNAL_API_URL?.trim();
  if (explicitInternal) {
    return explicitInternal.replace(/\/$/, "");
  }

  if (API_URL.startsWith("http://") || API_URL.startsWith("https://")) {
    return API_URL.replace(/\/$/, "");
  }

  return DEFAULT_INTERNAL_API_URL;
}

export function resolveApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (API_URL.startsWith("http://") || API_URL.startsWith("https://")) {
    return `${API_URL.replace(/\/$/, "")}${normalizedPath}`;
  }

  return `${API_URL.replace(/\/$/, "")}${normalizedPath}`;
}
