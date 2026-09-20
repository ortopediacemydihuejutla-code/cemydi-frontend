import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchSessionUserFromCookieHeader } from "@/lib/admin-session";

describe("admin-session", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null when cookieHeader is blank or whitespace", async () => {
    const user = await fetchSessionUserFromCookieHeader("   ");
    expect(user).toBeNull();
  });

  it("returns user profile when backend returns ok", async () => {
    const mockUser = {
      id: 1,
      nombre: "Admin Principal",
      correo: "admin@cemydi.com",
      activo: true,
      rol: "ADMIN" as const,
      emailVerified: true,
      emailVerifiedAt: "2026-01-01T00:00:00.000Z",
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser }),
    } as Response);

    const user = await fetchSessionUserFromCookieHeader("session_id=valid_token");
    expect(user).toEqual(mockUser);
  });

  it("returns null when backend responds with error status or malformed body", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: "Unauthorized" }),
    } as Response);

    const user = await fetchSessionUserFromCookieHeader("session_id=expired");
    expect(user).toBeNull();
  });
});
