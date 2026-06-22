import { apiFetch } from "@/lib/api-fetch";
import { parseApiResponse, parseJsonSafe, resolveErrorMessage } from "@/lib/api-error";

export function resolveFileNameFromDisposition(
  disposition: string | null,
  fallback: string,
) {
  if (!disposition) return fallback;

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].replace(/["']/g, ""));
    } catch {
      return utf8Match[1].replace(/["']/g, "");
    }
  }

  const basicMatch = disposition.match(/filename="?([^";]+)"?/i);
  if (basicMatch?.[1]) {
    return basicMatch[1].trim();
  }

  return fallback;
}

export async function adminRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const isFormData = init?.body instanceof FormData;
  const headers: Record<string, string> = {};

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (
    init?.headers &&
    typeof init.headers === "object" &&
    !Array.isArray(init.headers)
  ) {
    Object.assign(headers, init.headers as Record<string, string>);
  }

  const res = await apiFetch(path, {
    ...(init ?? {}),
    headers,
  });

  return parseApiResponse<T>(res, "Error en la solicitud");
}

export async function downloadBinaryResponse(
  path: string,
  fallbackName: string,
  errorMessage: string,
) {
  const response = await apiFetch(path, { method: "GET" });

  if (!response.ok) {
    let fallback = errorMessage;

    try {
      const result = await parseJsonSafe(response);
      fallback = resolveErrorMessage(result, fallback);
    } catch {
      // Ignorar parseo de error si la respuesta no es JSON.
    }

    throw new Error(fallback);
  }

  const blob = await response.blob();
  const fileName = resolveFileNameFromDisposition(
    response.headers.get("Content-Disposition"),
    fallbackName,
  );

  return { blob, fileName };
}
