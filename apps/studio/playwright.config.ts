import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  // CI builds cold, so allow generous time for Next dev's first lazy compile.
  // A global setup warms the routes first; timeouts give headroom on slow runners.
  workers: process.env.CI ? 1 : undefined,
  globalSetup: process.env.CI ? "./e2e/global-setup.ts" : undefined,
  timeout: 90000,
  expect: { timeout: 30000 },
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      STUDIO_MOCK_IMAGES: "true",
      PILOT_ACCESS_HASH: "07ae38b93d8054d84aac37039c71ad114a8685a3857084d568f260ce69f0737f",
      SESSION_SIGNING_SECRET: "e2e-only-secret-at-least-32-characters",
    },
  },
});
