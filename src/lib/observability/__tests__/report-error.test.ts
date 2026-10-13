import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { reportError } from "../report-error";

describe("reportError", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("logs full error object and context in development mode", () => {
    vi.stubEnv("NODE_ENV", "development");
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
    vi.stubEnv("NODE_ENV", "production");
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
    vi.stubEnv("NODE_ENV", "development");
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const err = new Error("Error repetitivo");
    reportError(err, { scope: "dedupe-scope" });
    reportError(err, { scope: "dedupe-scope" });

    expect(consoleSpy).toHaveBeenCalledTimes(1);
  });
});
