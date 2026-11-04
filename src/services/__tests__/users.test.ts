import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  confirmEmailChange,
  confirmPasswordChange,
  getMyProfile,
  requestEmailChange,
  requestPasswordChange,
  resendEmailChange,
  resendPasswordChange,
  updateMyProfile,
} from "../users";
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

  it("envía cambios sensibles por los seis endpoints OTP sin usar PATCH", async () => {
    const spy = vi.spyOn(apiFetchModule, "apiFetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ message: "Código enviado", resendAt: new Date().toISOString(), expiresAt: new Date().toISOString() }),
    } as unknown as Response);
    await requestEmailChange("nuevo@example.com", "Actual123!");
    await resendEmailChange();
    await confirmEmailChange("nuevo@example.com", "12345678");
    await requestPasswordChange("Actual123!");
    await resendPasswordChange();
    await confirmPasswordChange("12345678", "Nueva1234!");
    expect(spy.mock.calls.map(([path]) => path)).toEqual([
      "/users/me/email-change/request",
      "/users/me/email-change/resend",
      "/users/me/email-change/confirm",
      "/users/me/password-change/request",
      "/users/me/password-change/resend",
      "/users/me/password-change/confirm",
    ]);
    expect(spy.mock.calls[0][1]).toMatchObject({ method: "POST", body: JSON.stringify({ newEmail: "nuevo@example.com", currentPassword: "Actual123!" }) });
    expect(spy.mock.calls[5][1]).toMatchObject({ method: "POST", body: JSON.stringify({ codigo: "12345678", newPassword: "Nueva1234!" }) });
  });
});
