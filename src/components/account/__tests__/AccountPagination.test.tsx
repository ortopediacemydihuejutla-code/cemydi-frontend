import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AccountPagination } from "../AccountPagination";

describe("AccountPagination", () => {
  it("navigates to first, last and numbered pages with the real result range", () => {
    const change = vi.fn();
    render(
      <AccountPagination
        page={3}
        total={93}
        pageSize={20}
        totalPages={5}
        onPageChange={change}
      />,
    );
    expect(screen.getByText("41–60 de 93 resultados")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Primera página" }));
    fireEvent.click(screen.getByRole("button", { name: "Última página" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Página 2" }),
    );
    expect(change.mock.calls).toEqual([[1], [5], [2]]);
    expect(
      screen.getByRole("button", { name: "Página 3" }),
    ).toHaveAttribute("aria-current", "page");
  });
  it("rejects out of range and fractional jumps, then accepts a valid destination", () => {
    const change = vi.fn();
    render(
      <AccountPagination
        page={1}
        total={93}
        pageSize={20}
        totalPages={5}
        onPageChange={change}
      />,
    );
    const input = screen.getByRole("textbox", { name: "Página de destino" });
    for (const value of ["", "6", "0", "1.5", "abc"]) {
      fireEvent.change(input, { target: { value } });
      fireEvent.click(screen.getByRole("button", { name: "Ir" }));
      expect(screen.getByRole("alert")).toHaveTextContent("del 1 al 5");
    }
    expect(change).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: "Ir" }));
    expect(change).toHaveBeenCalledWith(5);
  });
  it("disables empty navigation and every control during loading", () => {
    const change = vi.fn();
    const view = render(
      <AccountPagination
        page={1}
        total={0}
        pageSize={20}
        totalPages={0}
        onPageChange={change}
      />,
    );
    expect(screen.getByText("0–0 de 0 resultados")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Página siguiente" }),
    ).toBeDisabled();
    view.rerender(
      <AccountPagination
        page={2}
        total={93}
        pageSize={20}
        totalPages={5}
        disabled
        onPageChange={change}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Primera página" }));
    expect(
      screen.getByRole("textbox", { name: "Página de destino" }),
    ).toBeDisabled();
    expect(change).not.toHaveBeenCalled();
  });
});
