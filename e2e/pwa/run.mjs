import { spawnSync } from "node:child_process";
const env = { ...process.env, INTERNAL_API_URL: "http://127.0.0.1:4199" };
// Build-time rewrites and runtime SSR must both point to the fixture backend.
for (const args of [
  ["node_modules/next/dist/bin/next", "build"],
  ["node_modules/@serwist/cli/dist/bin.mjs", "build", "serwist.config.mjs"],
  ["node_modules/@playwright/test/cli.js", "test", "--config", "playwright.pwa.config.ts"],
]) {
  const result = spawnSync(process.execPath, args, { env, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
