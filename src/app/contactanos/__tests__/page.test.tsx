import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ContactPage, { metadata } from "../page";

vi.mock("gsap", () => ({
  default: {
    context: (fn: () => void) => {
      fn();
      return { revert: vi.fn() };
    },
    from: vi.fn(),
  },
}));

describe("ContactPage", () => {
  it("defines metadata for SEO", () => {
    expect(metadata.title).toBe("Contáctanos");
    expect(metadata.description).toContain("Huejutla de Reyes");
  });

  it("renders key contact information and branch locations", () => {
    render(<ContactPage />);

    expect(
      screen.getByRole("heading", { name: "Atención sin vueltas." }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("789 688 0251").length).toBeGreaterThan(0);
    expect(screen.getByText("contacto@cemydi.com")).toBeInTheDocument();
    expect(screen.getAllByText("Farmacia CEMYDI").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Ortopedia CEMYDI").length).toBeGreaterThan(0);
  });
});
