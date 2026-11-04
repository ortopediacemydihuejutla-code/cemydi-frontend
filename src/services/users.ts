import { apiFetch } from "@/lib/api-fetch";
import { parseApiResponse } from "@/lib/api-error";
import { z } from "@/lib/zod";
import {
  authProfileResponseSchema,
  authProfileUpdateResponseSchema,
} from "@/lib/schemas/auth";
type UpdateProfilePayload = {
  nombre: string;
  telefono: string;
  direccion: string;
};

export async function getMyProfile() {
  const res = await apiFetch("/users/me", {
    method: "GET",
  });

  return parseApiResponse(res, "No se pudo obtener la sesion actual", authProfileResponseSchema);
}

const challengeSchema = z.object({
  message: z.string(),
  resendAt: z.string(),
  expiresAt: z.string(),
});

async function emailChangeRequest(path: string, body: object) {
  const res = await apiFetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseApiResponse(res, "No se pudo solicitar el código", challengeSchema);
}

export function requestEmailChange(newEmail: string, currentPassword: string) {
  return emailChangeRequest("/users/me/email-change/request", { newEmail, currentPassword });
}

export function resendEmailChange() {
  return emailChangeRequest("/users/me/email-change/resend", {});
}

export async function confirmEmailChange(newEmail: string, codigo: string) {
  const res = await apiFetch("/users/me/email-change/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ newEmail, codigo }),
  });
  return parseApiResponse<{ message: string }>(res, "No se pudo confirmar el correo");
}

export function requestPasswordChange(currentPassword: string) {
  return emailChangeRequest("/users/me/password-change/request", { currentPassword });
}

export function resendPasswordChange() {
  return emailChangeRequest("/users/me/password-change/resend", {});
}

export async function confirmPasswordChange(codigo: string, newPassword: string) {
  const res = await apiFetch("/users/me/password-change/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ codigo, newPassword }),
  });
  return parseApiResponse<{ message: string }>(res, "No se pudo cambiar la contraseña");
}

export async function updateMyProfile(data: UpdateProfilePayload) {
  const res = await apiFetch("/users/me", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return parseApiResponse(res, "No se pudo actualizar el perfil", authProfileUpdateResponseSchema);
}
