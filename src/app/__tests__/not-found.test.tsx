import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NotFound from "../not-found";

describe("NotFound 404 Page", () => {
  it("renders with data-not-found attribute for AppShell integration", () => {
    const { container } = render(<NotFound />);
    const main = container.querySelector("[data-not-found]");
    expect(main).toBeInTheDocument();
  });

  it("renders 404 number, clean heading without nested spans, and description text", () => {
    render(<NotFound />);
    expect(screen.getByText("404")).toBeInTheDocument();
    
    const heading = screen.getByRole("heading", { name: "Página no encontrada", level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.querySelector("span")).toBeNull();

    expect(
      screen.getByText(/La ruta que buscas no existe o ya no está disponible/i)
    ).toBeInTheDocument();
  });

  it("renders navigation links to home and catalog", () => {
    render(<NotFound />);
    const homeLink = screen.getByRole("link", { name: /Ir al inicio/i });
    expect(homeLink).toHaveAttribute("href", "/");

    const catalogLink = screen.getByRole("link", { name: /Ver catálogo/i });
    expect(catalogLink).toHaveAttribute("href", "/catalogo");
  });
});
