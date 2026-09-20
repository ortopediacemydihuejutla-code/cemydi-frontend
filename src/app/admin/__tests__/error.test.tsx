import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AdminError from "../error";
import * as reportErrorModule from "@/lib/observability/report-error";

describe("AdminError Boundary", () => {
  it("renders error alert, triggers reset and navigates to admin dashboard", () => {
    const reportSpy = vi.spyOn(reportErrorModule, "reportError").mockImplementation(() => {});
    const handleReset = vi.fn();
    const testError = Object.assign(new Error("Error de modulo admin"), {
      digest: "digest-admin-789",
    });

    render(<AdminError error={testError} reset={handleReset} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "No pudimos cargar este módulo" }),
    ).toBeInTheDocument();

    expect(reportSpy).toHaveBeenCalledWith(
      testError,
      expect.objectContaining({
        digest: "digest-admin-789",
        scope: "admin-error",
      }),
    );

    const retryBtn = screen.getByRole("button", { name: "Reintentar" });
    fireEvent.click(retryBtn);
    expect(handleReset).toHaveBeenCalledTimes(1);

    const dashboardLink = screen.getByRole("link", { name: "Ir al Dashboard" });
    expect(dashboardLink).toHaveAttribute("href", "/admin");
  });
});
