import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ErrorStateShell } from "../ErrorStateShell";

describe("ErrorStateShell Component", () => {
  const dummyError = new Error("Error de prueba");

  it("renders title, description and action buttons", () => {
    const handleRetry = vi.fn();
    render(
      <ErrorStateShell
        title="Error al procesar"
        description="Hubo un problema al cargar el recurso."
        actionText="Reintentar operación"
        secondaryHref="/"
        secondaryText="Volver al inicio"
        error={dummyError}
        onRetry={handleRetry}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Error al procesar", level: 1 })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Hubo un problema al cargar el recurso.")
    ).toBeInTheDocument();

    const retryBtn = screen.getByRole("button", { name: "Reintentar operación" });
    expect(retryBtn).toBeInTheDocument();
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);

    const homeLink = screen.getByRole("link", { name: "Volver al inicio" });
    expect(homeLink).toHaveAttribute("href", "/");
  });
});
