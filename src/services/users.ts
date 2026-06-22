import { apiFetch } from "@/lib/api-fetch";
import { parseApiResponse } from "@/lib/api-error";
import {
  authProfileResponseSchema,
  authProfileUpdateResponseSchema,
} from "@/lib/schemas/auth";
type UpdateProfilePayload = {
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string;
  password?: string;
};

export async function getMyProfile() {
  const res = await apiFetch("/users/me", {
    method: "GET",
  });

  return parseApiResponse(res, "No se pudo obtener la sesion actual", authProfileResponseSchema);
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
