import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AboutPage, { metadata } from "../page";
import { saveOfflineAbout } from "@/lib/pwa/storage";
import toast from "react-hot-toast";

vi.mock("@/lib/pwa/storage", () => ({ saveOfflineAbout: vi.fn() }));
vi.mock("react-hot-toast", () => ({ default: { error: vi.fn() } }));

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
  getAboutPageSnapshot: vi.fn().mockResolvedValue({ valid: true, content: {
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
  } }),
}));

describe("AboutPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(saveOfflineAbout).mockResolvedValue(undefined);
  });
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

  it("avisa si el contenido no se guarda y mantiene la página online disponible", async () => {
    vi.mocked(saveOfflineAbout).mockRejectedValueOnce(new Error("IndexedDB bloqueado"));
    render(await AboutPage());
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("No se pudo guardar el contenido institucional"),
      { id: "pwa-about-save" },
    ));
    expect(screen.getByRole("heading", { name: "Quiénes somos" })).toBeInTheDocument();
  });
});
