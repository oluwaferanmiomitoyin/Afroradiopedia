import { test, expect } from "@playwright/test";

// Flows a signed-out visitor can reach. Nothing here writes to Convex.

test.describe("landing", () => {
  test("renders the hero and routes to the analyze page", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("there's us.");

    await page.getByRole("link", { name: /analyze a scan/i }).first().click();
    await expect(page).toHaveURL(/\/analyze$/);
    await expect(page.getByRole("heading", { name: /upload a scan/i })).toBeVisible();
  });
});

test.describe("analyze page", () => {
  test.beforeEach(async ({ page }) => page.goto("/analyze"));

  test("is reachable without signing in", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /upload a scan/i })).toBeVisible();
    await expect(page).not.toHaveURL(/\/login/);
  });

  test("cannot submit before a scan is chosen", async ({ page }) => {
    await expect(page.getByRole("button", { name: /analyz/i }).last()).toBeDisabled();
  });

  test("offers both engines and defaults to the fast one", async ({ page }) => {
    const quick = page.getByRole("button", { name: /quick check/i });
    const deep = page.getByRole("button", { name: /deep scan/i });

    await expect(quick).toBeVisible();
    await expect(deep).toBeVisible();

    // Deep scan must advertise that it is slower — users abandon the page
    // otherwise, which is the whole reason DiagnosticLoadingState exists.
    await expect(deep).toContainText(/9?0\s*seconds|30s/i);

    await deep.click();
    await expect(deep).toHaveClass(/teal/);
  });

  test("lists the scan types the engine understands", async ({ page }) => {
    const select = page.locator("select").first();
    await expect(select).toBeVisible();
    expect(await select.locator("option").count()).toBeGreaterThan(1);
  });
});

test.describe("doctor application", () => {
  test("asks a signed-out visitor to sign in first", async ({ page }) => {
    await page.goto("/doctor-access");

    await expect(page.getByRole("heading", { name: /apply to contribute/i })).toBeVisible();
    // The form itself is behind sign-in — applications must be tied to a
    // verified identity, so no licence field is exposed to anonymous users.
    await expect(page.getByText(/medical license|practicing certificate/i)).toHaveCount(0);
    await expect(page.getByRole("button", { name: /sign in|continue with google/i }).first())
      .toBeVisible();
  });
});

test.describe("static pages", () => {
  for (const path of ["/about", "/contact", "/privacy", "/terms"]) {
    test(`${path} renders`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBeLessThan(400);
      await expect(page.locator("h1").first()).toBeVisible();
    });
  }
});

test.describe("auth gates", () => {
  for (const path of ["/admin/overview", "/doctor/dashboard", "/doctor/contribute"]) {
    test(`${path} is not readable signed out`, async ({ page }) => {
      await page.goto(path);
      // Either bounced to login, or rendered with the admin/doctor content
      // withheld. What must not happen is the real content showing.
      await expect(page.getByText(/sign in|log in|not authorised|unauthorized|loading/i).first())
        .toBeVisible({ timeout: 15_000 });
    });
  }
});
