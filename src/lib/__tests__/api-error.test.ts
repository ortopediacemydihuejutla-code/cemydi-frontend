import { describe, expect, it } from "vitest";

import { ApiError, resolveErrorMessage } from "@/lib/api-error";

describe("api-error", () => {
  it("resuelve mensajes de error del body", () => {
    expect(resolveErrorMessage({ message: "Credenciales inválidas" }, "Fallback")).toBe(
      "Credenciales inválidas",
    );
  });

  it("usa fallback cuando no hay mensaje", () => {
    expect(resolveErrorMessage(null, "Error genérico")).toBe("Error genérico");
  });

  it("localiza throttling", () => {
    expect(resolveErrorMessage({ message: "ThrottlerException" }, "Fallback")).toContain(
      "Demasiados intentos",
    );
  });

  it("crea ApiError con status", () => {
    const error = new ApiError("No autorizado", 401, { message: "No autorizado" });
    expect(error.status).toBe(401);
    expect(error.name).toBe("ApiError");
  });
});
