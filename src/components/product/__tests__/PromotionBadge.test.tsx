import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PromotionBadge } from "../PromotionBadge";

describe("PromotionBadge", () => {
  it("renders generic 'Oferta' when no percentage is provided", () => {
    render(<PromotionBadge />);
    expect(screen.getByText("Oferta")).toBeInTheDocument();
  });

  it("renders percentage with full text", () => {
    render(<PromotionBadge percent={25} />);
    expect(screen.getByText("25% de descuento")).toBeInTheDocument();
  });

  it("renders short label format when requested", () => {
    render(<PromotionBadge percent={15} shortLabel={true} />);
    expect(screen.getByText("15% OFF")).toBeInTheDocument();
  });
});
