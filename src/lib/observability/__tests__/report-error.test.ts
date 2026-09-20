import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { reportError } from "../report-error";

describe("reportError", () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it("logs full error object and context in development mode", () => {
    process.env.NODE_ENV = "development";
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const err = new Error("Error de prueba dev");
    reportError(err, { scope: "test-dev" });

    expect(consoleSpy).toHaveBeenCalledWith(
      "[reportError]",
      err,
      { scope: "test-dev" },
    );
  });

  it("logs structured error and triggers telemetry beacon in production", () => {
    process.env.NODE_ENV = "production";
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const sendBeaconSpy = vi.fn().mockReturnValue(true);

    Object.defineProperty(window.navigator, "sendBeacon", {
      value: sendBeaconSpy,
      writable: true,
      configurable: true,
    });

    const err = new Error("Error de prueba prod");
    reportError(err, { scope: "test-prod", digest: "dig-123" });

    expect(consoleSpy).toHaveBeenCalledWith(
      "[reportError]",
      expect.objectContaining({
        message: "Error de prueba prod",
        name: "Error",
        scope: "test-prod",
        digest: "dig-123",
      }),
    );

    expect(sendBeaconSpy).toHaveBeenCalledWith(
      "/api/observability/client-error",
      expect.any(Blob),
    );
  });

  it("deduplicates identical errors occurring within window", () => {
    process.env.NODE_ENV = "development";
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const err = new Error("Error repetitivo");
    reportError(err, { scope: "dedupe-scope" });
    reportError(err, { scope: "dedupe-scope" });

    expect(consoleSpy).toHaveBeenCalledTimes(1);
  });
});
