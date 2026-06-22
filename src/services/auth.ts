import { apiFetch } from "@/lib/api-fetch";
import { resolveApiUrl } from "@/lib/api-config";
import { parseApiResponse } from "@/lib/api-error";

export type AuthUser = {
  id: number;
  nombre: string;
  correo: string;
  activo: boolean;
  rol: "ADMIN" | "CLIENT";
  emailVerified: boolean;
  emailVerifiedAt: string | null;
};

export async function registerUser(data: {
  nombre: string;
  correo: string;
  password: string;
}) {
  const res = await fetch(resolveApiUrl("/auth/register"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  return parseApiResponse<{ message: string }>(res, "Error al registrar");
}

export async function loginUser(data: {
  correo: string;
  password: string;
}) {
  const res = await fetch(resolveApiUrl("/auth/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  return parseApiResponse<{ user: AuthUser }>(res, "Error al iniciar sesión");
}

export async function resendVerificationEmail(correo: string) {
  const res = await fetch(resolveApiUrl("/auth/email-verification/send"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ correo }),
  });

  return parseApiResponse<{ message: string }>(res, "No se pudo reenviar el enlace");
}

export async function confirmEmailVerification(token: string) {
  const res = await fetch(resolveApiUrl("/auth/email-verification/confirm"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ token }),
  });

  return parseApiResponse<{ message: string }>(res, "No se pudo verificar el correo");
}

export async function requestPasswordReset(correo: string) {
  const res = await fetch(resolveApiUrl("/auth/password-reset/request"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ correo }),
  });

  return parseApiResponse<{ message: string }>(res, "No se pudo solicitar el código");
}

export async function verifyPasswordResetCode(data: {
  correo: string;
  codigo: string;
}) {
  const res = await fetch(resolveApiUrl("/auth/password-reset/verify-code"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  return parseApiResponse<{ message: string; expiresAt: string }>(
    res,
    "No se pudo verificar el código",
  );
}

export async function confirmPasswordReset(data: {
  correo: string;
  codigo: string;
  newPassword: string;
}) {
  const res = await fetch(resolveApiUrl("/auth/password-reset/confirm"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  return parseApiResponse<{ message: string }>(res, "No se pudo restablecer la contraseña");
}

export async function logoutUser() {
  const res = await apiFetch("/auth/logout", {
    method: "POST",
  });

  return parseApiResponse<{ message: string }>(res, "No se pudo cerrar sesión");
}

export { refreshSession } from "@/lib/api-fetch";
