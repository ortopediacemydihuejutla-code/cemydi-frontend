import { describe, expect, it, vi, beforeEach } from "vitest";
import { POST } from "../route";

describe("POST /api/observability/client-error", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 204 No Content and logs structured telemetry for valid payload", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const payload = {
      message: "Fallo de renderizado",
      name: "TypeError",
      digest: "dig-456",
      scope: "admin-error",
      url: "http://localhost:3000/admin/products",
      timestamp: "2026-01-01T00:00:00.000Z",
    };

    const request = new Request("http://localhost:3000/api/observability/client-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const response = await POST(request);
    expect(response.status).toBe(204);
    expect(consoleSpy).toHaveBeenCalledWith(
      "[CLIENT_ERROR_TELEMETRY]",
      expect.stringContaining("Fallo de renderizado"),
    );
  });

  it("returns 400 Bad Request when payload is invalid", async () => {
    const request = new Request("http://localhost:3000/api/observability/client-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "SoloNombreSinMensaje" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe("Payload no válido");
  });
});
