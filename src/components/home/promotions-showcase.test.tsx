import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { ActivePromotion } from "@/services/catalog";
import { PromotionsShowcase } from "./promotions-showcase";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

function promotion(productId: number, name: string): ActivePromotion {
  return {
    id: 4,
    productId,
    discountPercent: 20,
    discountedPrice: 800,
    imageStrategy: "AUTO",
    descripcion: "Campaña compartida por productos seleccionados",
    startAt: "2026-07-27T00:00:00.000Z",
    endAt: "2026-08-03T23:59:59.999Z",
    imageUrl: null,
    createdAt: "2026-07-27T00:00:00.000Z",
    product: {
      id: productId,
      nombre: name,
      marca: "Drive Medical",
      modelo: `MOD-${productId}`,
      clasificacion: "Movilidad",
      precio: 1000,
      stock: 5,
      activo: true,
      tipoAdquisicion: "VENTA",
      requiereReceta: false,
      imageUrl: null,
    },
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("PromotionsShowcase", () => {
  it("renderiza productos de una misma campaña sin claves duplicadas", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    render(
      <PromotionsShowcase
        promotions={[
          promotion(4, "Silla de ruedas"),
          promotion(5, "Andadera plegable"),
        ]}
      />,
    );

    expect(screen.getByText("Silla de ruedas")).toBeInTheDocument();
    expect(screen.getByText("Andadera plegable")).toBeInTheDocument();
    expect(screen.getAllByText("Venta")).toHaveLength(2);
    expect(
      screen.getByRole("button", {
        name: "Compartir Silla de ruedas",
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("20% OFF")).toHaveLength(2);
    for (const badge of screen.getAllByText("20% OFF")) {
      expect(badge).toHaveClass("bg-[#c62828]", "text-white");
    }
    expect(
      consoleError.mock.calls.some((call) =>
        call.some(
          (value) =>
            typeof value === "string" &&
            value.includes("same key"),
        ),
      ),
    ).toBe(false);
  });
});
