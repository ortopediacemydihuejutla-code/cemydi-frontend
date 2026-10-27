import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it } from "vitest";
import { AdminThemeProvider, useAdminTheme } from "../admin-theme-provider";

function ThemeControl() {
  const { dark, toggleDark } = useAdminTheme();
  return <button onClick={toggleDark}>{dark ? "Oscuro" : "Claro"}</button>;
}

beforeEach(() => localStorage.clear());

it("recupera la preferencia de tema después de desmontar y volver a abrir el panel", () => {
  const first = render(<AdminThemeProvider><ThemeControl /></AdminThemeProvider>);
  fireEvent.click(screen.getByRole("button", { name: "Claro" }));
  expect(localStorage.getItem("cemydi-admin-theme")).toBe("dark");
  first.unmount();
  render(<AdminThemeProvider><ThemeControl /></AdminThemeProvider>);
  expect(screen.getByRole("button", { name: "Oscuro" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Oscuro" }));
  expect(localStorage.getItem("cemydi-admin-theme")).toBe("light");
});
