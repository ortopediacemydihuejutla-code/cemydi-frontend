import { render, screen } from "@testing-library/react";
import { PackageOpen } from "lucide-react";
import { describe, expect, it } from "vitest";
import { AccountEmptyState } from "../AccountEmptyState";

describe("AccountEmptyState", () => {
  it("renders title, description and optional action", () => {
    render(
      <AccountEmptyState
        icon={PackageOpen}
        title="Sin solicitudes activas"
        description="Aun no has realizado ninguna solicitud de renta."
        action={<button type="button">Explorar catalogo</button>}
      />,
    );

    expect(screen.getByText("Sin solicitudes activas")).toBeInTheDocument();
    expect(
      screen.getByText("Aun no has realizado ninguna solicitud de renta."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Explorar catalogo" }),
    ).toBeInTheDocument();
  });
});
