import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AboutPage, { metadata } from "../page";

vi.mock("gsap", () => ({
  default: {
    context: (fn: () => void) => {
      fn();
      return { revert: vi.fn() };
    },
    from: vi.fn(),
  },
}));

vi.mock("@/services/about-page", () => ({
  defaultAboutPageContent: {
    id: 1,
    heroTitle: "Quiénes somos",
    heroSubtitle: "Cuidamos tu movilidad",
    missionTitle: "Misión",
    missionText: "Brindar soluciones ortopédicas",
    visionTitle: "Visión",
    visionText: "Ser la ortopedia de referencia",
    valuesTitle: "Valores",
    values: ["Empatía", "Confianza"],
    storyTitle: "Atención pensada para personas reales",
    storyText: "En CEMYDI reunimos experiencia",
    heroImageUrl: "/img_Contactanos.png",
    secondaryImageUrl: "/fondowan.png",
  },
  getAboutPageContent: vi.fn().mockResolvedValue({
    id: 1,
    heroTitle: "Quiénes somos",
    heroSubtitle: "Cuidamos tu movilidad",
    missionTitle: "Misión",
    missionText: "Brindar soluciones ortopédicas",
    visionTitle: "Visión",
    visionText: "Ser la ortopedia de referencia",
    valuesTitle: "Valores",
    values: ["Empatía", "Confianza"],
    storyTitle: "Atención pensada para personas reales",
    storyText: "En CEMYDI reunimos experiencia",
    heroImageUrl: "/img_Contactanos.png",
    secondaryImageUrl: "/fondowan.png",
  }),
}));

describe("AboutPage", () => {
  it("defines metadata for SEO", () => {
    expect(metadata.title).toBe("Quiénes somos");
    expect(metadata.description).toContain("misión, visión y valores");
  });

  it("renders page content fetched from service", async () => {
    const Component = await AboutPage();
    render(Component);

    expect(screen.getByRole("heading", { name: "Quiénes somos" })).toBeInTheDocument();
    expect(screen.getByText("Brindar soluciones ortopédicas")).toBeInTheDocument();
  });
});
