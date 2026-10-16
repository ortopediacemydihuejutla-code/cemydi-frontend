import { afterEach, describe, expect, it, vi } from "vitest";
import { createContentSecurityPolicy } from "../content-security-policy";

afterEach(() => vi.unstubAllEnvs());

describe("content security policy", () => {
  it("requires a nonce for inline scripts and keeps workers same-origin in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    const policy = createContentSecurityPolicy("test-nonce");
    const scripts = policy.split(";").find((part) => part.trim().startsWith("script-src"));
    expect(scripts).toContain("'nonce-test-nonce'");
    expect(scripts).not.toMatch(/unsafe-inline|unsafe-eval/);
    expect(policy).toContain("worker-src 'self'");
    expect(policy).toContain("frame-src 'self' https://www.google.com");
    expect(policy).toContain("frame-ancestors 'none'");
  });

  it("permits eval only for development and preserves configured API origins", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.cemydi.test/v1");
    expect(createContentSecurityPolicy("test")).toContain("'unsafe-eval'");
    expect(createContentSecurityPolicy("test")).toContain("https://api.cemydi.test");
  });
});
