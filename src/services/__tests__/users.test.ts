import { describe, expect, it, vi, beforeEach } from "vitest";
import { getMyProfile, updateMyProfile } from "../users";
import * as apiFetchModule from "@/lib/api-fetch";

describe("Users Service", () => {
  const dummyUser = {
    id: 1,
    nombre: "Juan",
    correo: "juan@example.com",
    activo: true,
    rol: "CLIENT" as const,
    emailVerified: true,
    emailVerifiedAt: "2026-01-01",
    telefono: "7891234567",
    direccion: "Calle Hidalgo #10",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getMyProfile fetches authenticated user profile", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({ user: dummyUser }),
    };
    const spy = vi.spyOn(apiFetchModule, "apiFetch").mockResolvedValue(mockResponse as unknown as Response);

    const result = await getMyProfile();
    expect(spy).toHaveBeenCalledWith("/users/me", { method: "GET" });
    expect(result.user).toEqual(dummyUser);
  });

  it("updateMyProfile sends PATCH with updated data", async () => {
    const updatedUser = {
      ...dummyUser,
      nombre: "Juan Carlos",
      telefono: "7899876543",
    };
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({
        message: "Perfil actualizado",
        user: updatedUser,
      }),
    };
    const spy = vi.spyOn(apiFetchModule, "apiFetch").mockResolvedValue(mockResponse as unknown as Response);

    const payload = {
      nombre: "Juan Carlos",
      correo: "juan@example.com",
      telefono: "7899876543",
      direccion: "Calle Hidalgo #10",
    };

    const result = await updateMyProfile(payload);
    expect(spy).toHaveBeenCalledWith("/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    expect(result.message).toBe("Perfil actualizado");
    expect(result.user.nombre).toBe("Juan Carlos");
  });
});
