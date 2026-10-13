import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HomeHero } from "./HomeHero";

describe("HomeHero", () => {
  it("muestra el encabezado y el acceso al catálogo", () => {
    render(<HomeHero />);

    expect(
      screen.getByRole("heading", { level: 1, name: /tu bienestar es nuestra prioridad/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /explorar catálogo/i }),
    ).toHaveAttribute("href", "/catalogo");
  });

  it("permite crear una cuenta", () => {
    render(<HomeHero />);

    expect(
      screen.getByRole("link", { name: /crear cuenta/i }),
    ).toHaveAttribute("href", "/register");
  });
});
