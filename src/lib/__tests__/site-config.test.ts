import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { getClientSiteUrl, getSiteUrl } from "@/lib/site-config";

describe("site-config", () => {
  const originalEnv = process.env.NEXT_PUBLIC_SITE_URL;

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = originalEnv;
  });

  it("returns default localhost:3000 when env variable is missing", () => {
    expect(getSiteUrl()).toBe("http://localhost:3000");
  });

  it("trims trailing slash from configured site url", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://cemydi.com.mx/";
    expect(getSiteUrl()).toBe("https://cemydi.com.mx");
  });

  it("getClientSiteUrl returns window.location.origin in client environment", () => {
    expect(getClientSiteUrl()).toBe(window.location.origin);
  });
});
