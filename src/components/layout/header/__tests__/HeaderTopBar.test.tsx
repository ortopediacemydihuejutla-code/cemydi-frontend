import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HeaderTopBar from "../HeaderTopBar";

describe("HeaderTopBar", () => {
  it("renders branch location links and phone number", () => {
    render(<HeaderTopBar />);

    expect(screen.getByText("Av. Corona del Rosal #50")).toBeInTheDocument();
    expect(screen.getByText("Av. Javier Rojo Gómez #26")).toBeInTheDocument();
    expect(screen.getByText("789 688 0251")).toBeInTheDocument();

    const phoneLink = screen.getByRole("link", { name: /789 688 0251/i });
    expect(phoneLink).toHaveAttribute("href", "tel:7896880251");
  });

  it("renders social network links with correct attributes", () => {
    render(<HeaderTopBar />);

    const facebookLink = screen.getByLabelText("Visitar página de Facebook de CEMYDI");
    expect(facebookLink).toHaveAttribute("href", "https://www.facebook.com/OrtopediaCEMYDI");
    expect(facebookLink).toHaveAttribute("target", "_blank");
    expect(facebookLink).toHaveAttribute("rel", "noopener noreferrer");

    const whatsappLink = screen.getByLabelText("Contactar por WhatsApp a CEMYDI");
    expect(whatsappLink).toHaveAttribute("href", expect.stringContaining("https://wa.me/527896880251"));
    expect(whatsappLink).toHaveAttribute("target", "_blank");
    expect(whatsappLink).toHaveAttribute("rel", "noopener noreferrer");

    const instagramLink = screen.getByLabelText("Visitar perfil de Instagram de CEMYDI");
    expect(instagramLink).toHaveAttribute("href", "https://www.instagram.com/");
    expect(instagramLink).toHaveAttribute("target", "_blank");
    expect(instagramLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("applies hidden animation classes when isHidden is true", () => {
    const { container, rerender } = render(<HeaderTopBar isHidden={false} />);
    const aside = container.querySelector("aside");

    expect(aside).toHaveClass("grid-rows-[1fr]");
    expect(aside).toHaveClass("opacity-100");

    rerender(<HeaderTopBar isHidden={true} />);
    expect(aside).toHaveClass("grid-rows-[0fr]");
    expect(aside).toHaveClass("opacity-0");
    expect(aside).toHaveClass("pointer-events-none");
  });
});
