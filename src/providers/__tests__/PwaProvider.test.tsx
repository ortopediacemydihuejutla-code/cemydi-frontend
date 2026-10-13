import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import toast, { Toaster } from "react-hot-toast";
import PwaProvider from "../PwaProvider";

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
});
