import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConfirmDialog } from "../confirm-dialog";

describe("ConfirmDialog", () => {
  it("renders title, description and triggers actions", () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();

    render(
      <ConfirmDialog
        open={true}
        title="Eliminar producto"
        description="Esta accion no se puede deshacer"
        confirmLabel="Eliminar"
        cancelLabel="Volver"
        tone="danger"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />,
    );

    expect(screen.getByText("Eliminar producto")).toBeInTheDocument();
    expect(screen.getByText("Esta accion no se puede deshacer")).toBeInTheDocument();

    const confirmBtn = screen.getByRole("button", { name: "Eliminar" });
    const cancelBtn = screen.getByRole("button", { name: "Volver" });

    expect(confirmBtn).toBeInTheDocument();
    expect(cancelBtn).toBeInTheDocument();

    fireEvent.click(confirmBtn);
    expect(handleConfirm).toHaveBeenCalledTimes(1);

    fireEvent.click(cancelBtn);
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it("shows busy state and disables buttons", () => {
    render(
      <ConfirmDialog
        open={true}
        title="Guardando cambios"
        busy={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByText("Procesando...")).toBeInTheDocument();
    const buttons = screen.getAllByRole("button");
    for (const btn of buttons) {
      expect(btn).toBeDisabled();
    }
  });
});
