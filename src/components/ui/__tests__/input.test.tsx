import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Input } from "../input";

describe("Input UI Component", () => {
  it("renders input field with proper classes and attributes", () => {
    render(<Input placeholder="Buscar productos..." />);
    const input = screen.getByPlaceholderText("Buscar productos...");
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass("focus-visible:outline-[#258e8b]");
  });

  it("handles disabled state correctly", () => {
    render(<Input disabled placeholder="Deshabilitado" />);
    const input = screen.getByPlaceholderText("Deshabilitado");
    expect(input).toBeDisabled();
    expect(input).toHaveClass("disabled:opacity-50");
  });
});
