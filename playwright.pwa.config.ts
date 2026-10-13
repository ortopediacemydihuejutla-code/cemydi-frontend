import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e/pwa",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  reporter: "list",
  use: { baseURL: "http://localhost:3199", serviceWorkers: "allow", trace: "retain-on-failure" },
  projects: [{ name: "chromium-pwa", use: { ...devices["Desktop Chrome"] } }],
  webServer: { command: "node e2e/pwa/server.mjs", url: "http://localhost:3199", reuseExistingServer: false, timeout: 60_000 },
});
