import { defineConfig, devices } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

// Written by `npm run e2e:login`. The authenticated project is only
// registered when it exists, so a fresh clone runs the public suite instead
// of failing on a missing file.
export const AUTH_STATE = path.join(__dirname, "e2e/.auth/admin.json");
const hasAuth = fs.existsSync(AUTH_STATE);

// Live tests hit the real diagnostic engine and write to Convex. They are
// excluded unless you ask for them, because Convex prod is the only
// deployment this project has.
const runLive = process.env.RUN_LIVE === "1";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  grepInvert: runLive ? undefined : /@live/,

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "public",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: /authenticated\.spec\.ts/,
    },
    ...(hasAuth
      ? [
          {
            name: "authenticated",
            use: { ...devices["Desktop Chrome"], storageState: AUTH_STATE },
            testMatch: /authenticated\.spec\.ts/,
          },
        ]
      : []),
  ],

  webServer: {
    command: "npm run dev",
    url: BASE_URL,
    reuseExistingServer: true,
    // Next's first compile on a cold .next is slow.
    timeout: 180_000,
  },
});
