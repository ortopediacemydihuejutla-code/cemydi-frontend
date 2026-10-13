import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import VoiceSearchButton from "../VoiceSearchButton";

describe("VoiceSearchButton", () => {
  it("renderiza el botón inactivo con el aria-label correspondiente", () => {
    const handleToggle = vi.fn();
    render(<VoiceSearchButton isListening={false} onToggle={handleToggle} variant="header" />);

    const button = screen.getByRole("button", { name: "Buscar por voz" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(button).toHaveAttribute("title", "Buscar por voz");

    fireEvent.click(button);
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it("renderiza el botón activo en estado de escucha", () => {
    const handleToggle = vi.fn();
    render(<VoiceSearchButton isListening={true} onToggle={handleToggle} variant="catalog" />);

    const button = screen.getByRole("button", { name: "Detener búsqueda por voz" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveAttribute("title", "Escuchando... Haz clic para detener");
  });
});
