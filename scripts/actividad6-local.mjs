// Isolated audit commands: do not change the developer's private .env.local.
import { spawn } from "node:child_process";

const commands = {
  build: ["node_modules/next/dist/bin/next", "build"],
  start: ["node_modules/next/dist/bin/next", "start", "--port", "3001"],
  e2e: ["node_modules/@playwright/test/cli.js", "test", "--workers=2"],
};
const command = commands[process.argv[2]];
if (!command) throw new Error("Use build, start or e2e");
const env = { ...process.env, INTERNAL_API_URL: "http://127.0.0.1:4000", CI: "1", PLAYWRIGHT_BASE_URL: "http://localhost:3001" };
let child;
process.on("SIGINT", () => child?.kill());
function run(args) {
  return new Promise((resolve) => {
    child = spawn(process.execPath, args, { stdio: "inherit", env });
    child.on("error", () => resolve(1));
    child.on("exit", (code) => resolve(code ?? 1));
  });
}
let code = await run(command);
if (code === 0 && process.argv[2] === "build") {
  code = await run(["node_modules/@serwist/cli/dist/bin.mjs", "build", "serwist.config.mjs"]);
}
process.exitCode = code;
