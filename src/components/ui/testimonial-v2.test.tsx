import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TestimonialsSection from "./testimonial-v2";

const preferences = vi.hoisted(() => ({ reducedMotion: false }));
vi.mock("framer-motion", async (original) => ({
  ...await original<typeof import("framer-motion")>(),
  useReducedMotion: () => preferences.reducedMotion,
}));

const testimonials = Array.from({ length: 4 }, (_, index) => ({
  id: index + 1,
  rating: 5,
  comment: `Opinión ${index + 1}`,
  createdAt: "2026-01-01T00:00:00Z",
  product: { id: 1, nombre: "Equipo", clasificacion: "Movilidad" },
  user: { id: index + 1, nombre: `Cliente ${index + 1}` },
}));

describe("testimonios", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    preferences.reducedMotion = false;
    vi.stubGlobal("innerWidth", 390);
    vi.stubGlobal("IntersectionObserver", class {
      observe() {}
      unobserve() {}
      disconnect() {}
    });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it.each([[4, 4], [5, 5], [3.6, 4], [0, 0]])(
    "expone la valoración %s como %s estrellas y oculta sus iconos",
    (rating, expected) => {
      render(<TestimonialsSection testimonials={testimonials.map((item, index) =>
        index === 0 ? { ...item, rating } : item,
      )} />);

      const text = within(screen.getAllByRole("article")[0]).getByText(`${expected} de 5 estrellas`);
      expect(text).toHaveClass("sr-only");
      expect(text.parentElement).not.toHaveAttribute("aria-label");
      expect(text.parentElement?.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(5);
    },
  );

  it("permite pausar y reanudar el avance", () => {
    render(<TestimonialsSection testimonials={testimonials} />);
    fireEvent.click(screen.getByRole("button", { name: "Pausar testimonios" }));
    act(() => vi.advanceTimersByTime(8_000));
    expect(screen.getByRole("button", { name: "Ir al testimonio 1" })).toHaveAttribute("aria-current", "true");
    fireEvent.click(screen.getByRole("button", { name: "Reanudar testimonios" }));
    act(() => vi.advanceTimersByTime(4_000));
    expect(screen.getByRole("button", { name: "Ir al testimonio 2" })).toHaveAttribute("aria-current", "true");
  });

  it("detiene el avance mientras se lee con el puntero encima", () => {
    render(<TestimonialsSection testimonials={testimonials} />);
    const section = screen.getByRole("region", { name: "Personas que confían en CEMYDI" });
    fireEvent.mouseEnter(section);
    act(() => vi.advanceTimersByTime(8_000));
    expect(screen.getByRole("button", { name: "Ir al testimonio 1" })).toHaveAttribute("aria-current", "true");
    fireEvent.mouseLeave(section);
    act(() => vi.advanceTimersByTime(4_000));
    expect(screen.getByRole("button", { name: "Ir al testimonio 2" })).toHaveAttribute("aria-current", "true");
  });

  it("detiene el avance cuando los controles tienen foco", () => {
    render(<TestimonialsSection testimonials={testimonials} />);
    fireEvent.focus(screen.getByRole("button", { name: "Siguiente testimonio" }));
    act(() => vi.advanceTimersByTime(8_000));
    expect(screen.getByRole("button", { name: "Ir al testimonio 1" })).toHaveAttribute("aria-current", "true");
  });

  it("respeta movimiento reducido y conserva navegación manual", () => {
    preferences.reducedMotion = true;
    render(<TestimonialsSection testimonials={testimonials} />);
    expect(screen.queryByRole("button", { name: "Pausar testimonios" })).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(8_000));
    expect(screen.getByRole("button", { name: "Ir al testimonio 1" })).toHaveAttribute("aria-current", "true");
    fireEvent.click(screen.getByRole("button", { name: "Siguiente testimonio" }));
    expect(screen.getByRole("button", { name: "Ir al testimonio 2" })).toHaveAttribute("aria-current", "true");
  });
});
