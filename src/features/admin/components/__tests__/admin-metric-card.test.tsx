import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AdminMetricCard } from "../admin-metric-card";

describe("AdminMetricCard", () => {
  it("renders label, value, and helper text", () => {
    render(
      <AdminMetricCard
        context="products-active"
        label="Productos Activos"
        value={142}
        helper="En catalogo publico"
      />,
    );

    expect(screen.getByText("Productos Activos")).toBeInTheDocument();
    expect(screen.getByText("142")).toBeInTheDocument();
    expect(screen.getByText("En catalogo publico")).toBeInTheDocument();
  });

  it("renders without helper when omitted", () => {
    render(
      <AdminMetricCard
        context="analytics-revenue"
        label="Ingresos Totales"
        value="$45,200"
      />,
    );

    expect(screen.getByText("Ingresos Totales")).toBeInTheDocument();
    expect(screen.getByText("$45,200")).toBeInTheDocument();
  });
});
