import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import CatalogToolbar from "../CatalogToolbar";

describe("CatalogToolbar", () => {
  const defaultProps = {
    searchQuery: "",
    sort: "reciente" as const,
    view: "grid" as const,
    activeFilterCount: 0,
    onSearchSubmit: vi.fn(),
    onSortChange: vi.fn(),
    onViewChange: vi.fn(),
    onOpenMobileFilters: vi.fn(),
  };

  it("renderiza el campo de búsqueda con el botón de voz", () => {
    render(<CatalogToolbar {...defaultProps} />);

    expect(
      screen.getByRole("searchbox", { name: "Buscar en el catálogo" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Buscar por voz" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Buscar" }),
    ).toBeInTheDocument();
  });

  it("permite escribir y enviar una búsqueda manual", () => {
    const onSearchSubmit = vi.fn();
    render(<CatalogToolbar {...defaultProps} onSearchSubmit={onSearchSubmit} />);

    const searchInput = screen.getByRole("searchbox", { name: "Buscar en el catálogo" });
    fireEvent.change(searchInput, { target: { value: "andadera" } });

    const submitButton = screen.getByRole("button", { name: "Buscar" });
    fireEvent.click(submitButton);

    expect(onSearchSubmit).toHaveBeenCalledWith("andadera");
  });
});
