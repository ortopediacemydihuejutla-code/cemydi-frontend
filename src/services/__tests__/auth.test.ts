import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  registerUser,
  loginUser,
  resendVerificationEmail,
  confirmEmailVerification,
  confirmEmailVerificationCode,
  requestPasswordReset,
  verifyPasswordResetCode,
  confirmPasswordReset,
  logoutUser,
} from "../auth";
import * as apiFetchModule from "@/lib/api-fetch";

describe("Auth Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registerUser sends POST request with json data", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({ message: "Usuario registrado con exito" }),
    };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse as unknown as Response);

    const result = await registerUser({
      nombre: "Maria",
      correo: "maria@example.com",
      password: "Password123!",
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("/auth/register"),
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      }),
    );
    expect(result.message).toBe("Usuario registrado con exito");
  });

  it("loginUser sends POST request and returns user object", async () => {
    const mockUser = {
      id: 1,
      nombre: "Maria",
      correo: "maria@example.com",
      activo: true,
      rol: "CLIENT" as const,
      emailVerified: true,
      emailVerifiedAt: "2026-01-01",
    };
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({ user: mockUser }),
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse as unknown as Response);

    const result = await loginUser({
      correo: "maria@example.com",
      password: "Password123!",
    });

    expect(result.user).toEqual(mockUser);
  });

  it("resendVerificationEmail sends email to endpoint", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({ message: "Correo reenviado" }),
    };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse as unknown as Response);

    const result = await resendVerificationEmail("maria@example.com");
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("/auth/email-verification/send"),
      expect.objectContaining({ method: "POST" }),
    );
    expect(result.message).toBe("Correo reenviado");
  });

  it("confirmEmailVerification sends token", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({ message: "Verificado" }),
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse as unknown as Response);

    const result = await confirmEmailVerification("tok-123");
    expect(result.message).toBe("Verificado");
  });

  it("confirmEmailVerificationCode sends email and code", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({ message: "Codigo correcto" }),
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse as unknown as Response);

    const result = await confirmEmailVerificationCode({
      correo: "maria@example.com",
      codigo: "123456",
    });
    expect(result.message).toBe("Codigo correcto");
  });

  it("handles password reset lifecycle", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ message: "Codigo enviado" }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ message: "Codigo valido", expiresAt: "2026-01-01" }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ message: "Contrasena restablecida" }),
      } as unknown as Response);

    const reqRes = await requestPasswordReset("maria@example.com");
    expect(reqRes.message).toBe("Codigo enviado");

    const verifyRes = await verifyPasswordResetCode({
      correo: "maria@example.com",
      codigo: "123456",
    });
    expect(verifyRes.message).toBe("Codigo valido");

    const confRes = await confirmPasswordReset({
      correo: "maria@example.com",
      codigo: "123456",
      newPassword: "NewPassword123!",
    });
    expect(confRes.message).toBe("Contrasena restablecida");
  });

  it("logoutUser calls apiFetch with /auth/logout", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({ message: "Sesion cerrada" }),
    };
    const apiSpy = vi.spyOn(apiFetchModule, "apiFetch").mockResolvedValue(mockResponse as unknown as Response);

    const result = await logoutUser();
    expect(apiSpy).toHaveBeenCalledWith("/auth/logout", { method: "POST" });
    expect(result.message).toBe("Sesion cerrada");
  });
});
