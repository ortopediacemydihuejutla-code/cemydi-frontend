import type { ZodType } from "zod";

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body ?? null;
  }
}

export function isDevelopmentMode() {
  return process.env.NODE_ENV === "development";
}

export function resolveErrorMessage(body: unknown, fallback: string) {
  if (typeof body === "object" && body !== null && "message" in body) {
    const message = (body as { message?: string | string[] }).message;
    if (Array.isArray(message)) {
      return message.map(localizeApiErrorText).join(", ");
    }
    if (typeof message === "string" && message.trim()) {
      return localizeApiErrorText(message);
    }
  }

  return fallback;
}

function localizeApiErrorText(message: string) {
  if (/ThrottlerException/i.test(message) || /Too Many Requests/i.test(message)) {
    return "Demasiados intentos. Espera un momento e inténtalo de nuevo.";
  }

  return message;
}

export async function parseJsonSafe(response: Response) {
  return response.json().catch(() => null);
}

export async function parseApiResponse<T>(
  response: Response,
  fallbackMessage: string,
  schema?: ZodType<T>,
): Promise<T> {
  const body = await parseJsonSafe(response);

  if (!response.ok) {
    throw new ApiError(
      resolveErrorMessage(body, fallbackMessage),
      response.status,
      body,
    );
  }

  if (!schema) {
    return body as T;
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    if (isDevelopmentMode()) {
      console.error("parseApiResponse schema mismatch", parsed.error.flatten());
    }

    throw new ApiError(
      "La respuesta del servidor no tiene el formato esperado.",
      502,
      parsed.error.flatten(),
    );
  }

  return parsed.data;
}

export function getClientErrorDetail(error: Error & { digest?: string }) {
  if (!isDevelopmentMode()) {
    return null;
  }

  if (error instanceof ApiError) {
    const parts = [error.message];
    if (error.status) {
      parts.unshift(`HTTP ${error.status}`);
    }
    return parts.join(" · ");
  }

  return error.message || null;
}
