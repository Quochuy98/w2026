import { defineConfig, devices } from "@playwright/test";

const e2ePort = process.env.PLAYWRIGHT_PORT || "3100";
const e2eUrl = `http://127.0.0.1:${e2ePort}`;

export default defineConfig({
  testDir: "./tests/e2e",
  // The dev server compiles the shared client graph lazily. Serialising the
  // small acceptance suite keeps first-load hydration deterministic on a
  // laptop while the projects still cover both desktop and mobile browsers.
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: e2eUrl,
    trace: "retain-on-failure",
  },
  webServer: {
    command: `npx next start -p ${e2ePort}`,
    url: e2eUrl,
    reuseExistingServer: true,
    timeout: 30000,
  },

  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["iPhone 13"] } },
  ],
});
