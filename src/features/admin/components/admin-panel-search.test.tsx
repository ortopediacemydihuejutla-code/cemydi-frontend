import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdminPanelSearch } from "./admin-panel-search";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    dismiss: vi.fn(),
    error: vi.fn(),
  },
}));

describe("AdminPanelSearch", () => {
  beforeEach(() => {
    push.mockClear();
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockReturnValue({ matches: true }),
    });
  });

  it("enfoca el buscador con Ctrl+K y navega al primer resultado", () => {
    render(<AdminPanelSearch shortcutLabel="Ctrl K" />);

    const input = screen.getByLabelText("Buscar en el panel", {
      selector: "#admin-panel-search",
    });

    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    expect(input).toHaveFocus();

    fireEvent.change(input, { target: { value: "inventario" } });
    expect(screen.getByText("Productos")).toBeInTheDocument();

    fireEvent.submit(input.closest("form")!);
    expect(push).toHaveBeenCalledWith("/admin/products");
  });
});
