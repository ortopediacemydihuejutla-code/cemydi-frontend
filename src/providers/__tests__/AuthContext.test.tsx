import { renderHook, act, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AuthProvider, useAuth, type AuthUserProfile } from "../AuthContext";

const mockUsePathname = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

const mockGetMyProfile = vi.fn();
vi.mock("@/services/users", () => ({
  getMyProfile: () => mockGetMyProfile(),
}));

describe("AuthContext", () => {
  const dummyUser: AuthUserProfile = {
    id: 1,
    nombre: "Juan Perez",
    correo: "juan@example.com",
    activo: true,
    rol: "CLIENT",
    emailVerified: true,
    emailVerifiedAt: "2026-01-01",
    telefono: "7891234567",
    direccion: "Calle Hidalgo #10",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockUsePathname.mockReturnValue("/");
  });

  it("throws an error when useAuth is used outside of AuthProvider", () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      "useAuth debe usarse dentro de AuthProvider",
    );
  });

  it("hydrates user profile on customer routes on mount", async () => {
    mockGetMyProfile.mockResolvedValueOnce({ user: dummyUser });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(dummyUser);
    expect(mockGetMyProfile).toHaveBeenCalledTimes(1);
  });

  it("sets user to null if profile fetching fails", async () => {
    mockGetMyProfile.mockRejectedValueOnce(new Error("Unauthorized"));

    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
  });

  it("skips hydration on admin routes", async () => {
    mockUsePathname.mockReturnValue("/admin/dashboard");

    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.loading).toBe(false);
    expect(mockGetMyProfile).not.toHaveBeenCalled();
    expect(result.current.user).toBeNull();
  });

  it("allows login, updateUser, and logout state changes", async () => {
    mockGetMyProfile.mockResolvedValueOnce({ user: null });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.login({ user: dummyUser });
    });
    expect(result.current.user).toEqual(dummyUser);

    act(() => {
      result.current.updateUser({ ...dummyUser, nombre: "Carlos" });
    });
    expect(result.current.user?.nombre).toBe("Carlos");

    act(() => {
      result.current.logout();
    });
    expect(result.current.user).toBeNull();
  });

  it("allows server-side hydration override", async () => {
    mockGetMyProfile.mockResolvedValueOnce({ user: null });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.hydrateFromServer(dummyUser);
    });

    expect(result.current.user).toEqual(dummyUser);
    expect(result.current.loading).toBe(false);
  });
});
