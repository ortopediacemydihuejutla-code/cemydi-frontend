import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "../button";

describe("Button UI Component", () => {
  it("renders with default variant and text", () => {
    render(<Button>Click me</Button>);
    const btn = screen.getByRole("button", { name: "Click me" });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveClass("bg-primary");
  });

  it("applies variant classes correctly", () => {
    render(<Button variant="destructive">Delete</Button>);
    const btn = screen.getByRole("button", { name: "Delete" });
    expect(btn).toHaveClass("bg-destructive");
  });

  it("handles disabled state", () => {
    render(<Button disabled>Disabled Button</Button>);
    const btn = screen.getByRole("button", { name: "Disabled Button" });
    expect(btn).toBeDisabled();
    expect(btn).toHaveClass("disabled:opacity-50");
  });
});
