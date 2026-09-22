import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HomeHero } from "./HomeHero";

describe("HomeHero", () => {
  it("muestra la primera diapositiva y sus acciones", () => {
    render(<HomeHero />);

    expect(
      screen.getByRole("heading", { name: /equipo médico para cuidar/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /explorar catálogo/i }),
    ).toHaveAttribute("href", "/catalogo");
  });

  it("permite navegar entre las diapositivas", async () => {
    render(<HomeHero />);

    fireEvent.click(
      screen.getByRole("button", { name: /diapositiva siguiente/i }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /renta equipo/i }),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole("link", { name: /ver equipos en renta/i }),
    ).toHaveAttribute("href", "/catalogo?tipos=RENTA");
  });

  it("permite pausar y reanudar el avance automático", () => {
    render(<HomeHero />);

    const pauseButton = screen.getByRole("button", {
      name: /pausar carrusel/i,
    });
    fireEvent.click(pauseButton);

    expect(
      screen.getByRole("button", { name: /reanudar carrusel/i }),
    ).toBeInTheDocument();
  });
});
