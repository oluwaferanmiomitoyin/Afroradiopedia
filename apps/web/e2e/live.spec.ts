import { test, expect } from "@playwright/test";
import path from "node:path";

// Full end-to-end: real Cloudinary upload, real Convex write, real
// diagnostic engine. Excluded unless RUN_LIVE=1 because Convex prod is this
// project's only deployment — every run leaves a row in `analyses`.
//
//   RUN_LIVE=1 npx playwright test live.spec.ts
//
// Rows are marked with E2E_MARKER so they can be found and deleted after.

const FIXTURE = path.join(__dirname, "fixtures/scan.png");
export const E2E_MARKER = "[e2e] automated test run — safe to delete";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? "http://localhost:8000";

test.describe("@live full diagnostic path", () => {
  test.beforeAll(async ({ request }) => {
    const res = await request.get(`${AI_SERVICE_URL}/health`, { timeout: 60_000 }).catch(() => null);
    test.skip(
      !res?.ok(),
      `No diagnostic engine at ${AI_SERVICE_URL}. Set AI_SERVICE_URL to your Space/Render URL.`
    );
  });

  test("engine reports which models it can serve", async ({ request }) => {
    const health = await request.get(`${AI_SERVICE_URL}/health`, { timeout: 60_000 });
    expect(health.ok()).toBeTruthy();

    const body = await health.json();
    test.info().annotations.push({
      type: "engine health",
      description: JSON.stringify(body),
    });
    // Gemini must be configured; MedGemma is allowed to be unavailable
    // (no HF_TOKEN, or a torch-less deploy) because it falls back.
    expect(JSON.stringify(body)).toMatch(/gemini/i);
  });

  test("upload a scan and get findings back", async ({ page }) => {
    test.setTimeout(240_000);

    await page.goto("/analyze");
    await page.getByRole("button", { name: /quick check/i }).click();

    await page.locator('input[type="file"]').setInputFiles(FIXTURE);
    await page.getByPlaceholder(/42-year-old male/i).fill(E2E_MARKER);

    await page.getByRole("button", { name: /analyz/i }).last().click();

    // Cloudinary upload, Convex insert, then the engine call.
    await expect(page.getByText(/results/i).first()).toBeVisible({ timeout: 30_000 });
    await expect(
      page.getByText(/via (quick check|deep scan)/i)
    ).toBeVisible({ timeout: 200_000 });

    const body = await page.locator("body").innerText();
    expect(body).not.toMatch(/analysis failed|please try again/i);
  });
});
