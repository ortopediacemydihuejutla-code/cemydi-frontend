import { describe, expect, it } from "vitest";
import { telemetryUrl } from "../telemetry-url";

describe("telemetryUrl", () => {
  it("retains only the origin and pathname", () => {
    expect(telemetryUrl("https://user:password@cemydi.test/verify-email?token=secret#code"))
      .toBe("https://cemydi.test/verify-email");
  });

  it("discards malformed or non-HTTP URLs", () => {
    expect(telemetryUrl("not a URL")).toBeUndefined();
    expect(telemetryUrl("javascript:alert(1)")).toBeUndefined();
    expect(telemetryUrl(undefined)).toBeUndefined();
  });
});
