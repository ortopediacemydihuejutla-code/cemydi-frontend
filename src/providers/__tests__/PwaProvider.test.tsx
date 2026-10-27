import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import toast, { Toaster } from "react-hot-toast";
import PwaProvider, { rememberReconnection } from "../PwaProvider";

describe("aviso de conectividad", () => {
  beforeEach(() => { vi.useFakeTimers(); sessionStorage.clear(); });
  afterEach(() => { toast.remove(); vi.restoreAllMocks(); vi.useRealTimers(); sessionStorage.clear(); });

  it("permanece offline y cambia a conexión restablecida durante cuatro segundos", () => {
    const online = vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    render(<PwaProvider><form><input aria-label="Búsqueda" defaultValue="" /></form><Toaster /></PwaProvider>);
    expect(screen.getByText("Sin conexión")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(15_000));
    expect(screen.getByText("Sin conexión")).toBeInTheDocument();
    // An edited form prevents the automatic reconnect reload.
    fireEvent.change(screen.getByRole("textbox", { name: "Búsqueda" }), { target: { value: "silla" } });
    act(() => { online.mockReturnValue(true); window.dispatchEvent(new Event("online")); });
    expect(screen.queryByText("Sin conexión")).not.toBeInTheDocument();
    expect(screen.getByText("Conexión restablecida")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(4_000));
    act(() => vi.advanceTimersByTime(1_100));
    expect(screen.queryByText("Conexión restablecida")).not.toBeInTheDocument();
  });

  it("conserva el tiempo restante después de recargar y no avisa en una visita normal", () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
    const first = render(<PwaProvider><Toaster /></PwaProvider>);
    expect(screen.queryByText("Conexión restablecida")).not.toBeInTheDocument();
    first.unmount();
    sessionStorage.setItem("cemydi-pwa-reconnected-at", String(Date.now() - 3_000));
    render(<PwaProvider><Toaster /></PwaProvider>);
    expect(screen.getByText("Conexión restablecida")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1_000));
    act(() => vi.advanceTimersByTime(1_100));
    expect(screen.queryByText("Conexión restablecida")).not.toBeInTheDocument();
  });

  it.each(["invalid", String(Date.now() - 10_000), String(Date.now() + 60_000)])("descarta una marca de reconexión inválida o vencida: %s", (value) => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
    sessionStorage.setItem("cemydi-pwa-reconnected-at", value);
    render(<PwaProvider><Toaster /></PwaProvider>);
    expect(screen.queryByText("Conexión restablecida")).not.toBeInTheDocument();
    expect(sessionStorage.getItem("cemydi-pwa-reconnected-at")).toBeNull();
  });

  it("continúa si el navegador bloquea el almacenamiento de sesión", () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new DOMException("Blocked", "SecurityError"); });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("Blocked", "SecurityError"); });
    expect(rememberReconnection).not.toThrow();
    expect(() => render(<PwaProvider><Toaster /></PwaProvider>)).not.toThrow();
  });
});
