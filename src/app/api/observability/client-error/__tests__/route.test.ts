import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

let POST: typeof import("../route").POST;

describe("POST /api/observability/client-error", () => {
  beforeEach(async () => {
    vi.resetModules();
    POST = (await import("../route")).POST;
  });
  afterEach(() => vi.restoreAllMocks());

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

  it("redacts URL credentials, query parameters and fragments before logging", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const response = await POST(new Request("https://cemydi.test/api/observability/client-error", {
      method: "POST",
      body: JSON.stringify({ message: "Error", url: "https://user:secret@cemydi.test/reset-password?token=private&correo=patient#code" }),
    }));
    expect(response.status).toBe(204);
    const log = JSON.parse(consoleSpy.mock.calls[0][1] as string);
    expect(log.url).toBe("https://cemydi.test/reset-password");
    expect(JSON.stringify(log)).not.toMatch(/private|patient|secret/);
  });

  it("rejects an oversized stream even without Content-Length", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const response = await POST(new Request("https://cemydi.test/api/observability/client-error", {
      method: "POST", body: JSON.stringify({ message: "a".repeat(17 * 1024) }),
    }));
    expect(response.status).toBe(413);
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it("rejects cross-origin reports", async () => {
    const response = await POST(new Request("https://cemydi.test/api/observability/client-error", {
      method: "POST", headers: { Origin: "https://other.test" }, body: JSON.stringify({ message: "Error" }),
    }));
    expect(response.status).toBe(403);
  });

  it("limits reports per process and allows reports after the window expires", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const clock = vi.spyOn(Date, "now").mockReturnValue(100_000);
    const report = () => POST(new Request("https://cemydi.test/api/observability/client-error", {
      method: "POST", body: JSON.stringify({ message: "Error" }),
    }));
    for (let i = 0; i < 300; i++) expect((await report()).status).toBe(204);
    expect((await report()).status).toBe(429);
    clock.mockReturnValue(160_000);
    expect((await report()).status).toBe(204);
  });

  it("rejects unbounded or invalid timestamps", async () => {
    const response = await POST(new Request("https://cemydi.test/api/observability/client-error", {
      method: "POST", body: JSON.stringify({ message: "Error", timestamp: "a".repeat(1000) }),
    }));
    expect(response.status).toBe(400);
  });
});
