import { test, expect } from "@playwright/test";

// Runs only when e2e/.auth/admin.json exists — see `npm run e2e:login`.
// The saved session belongs to an admin account, so both the admin console
// and the doctor pages are reachable.

test.describe("admin console", () => {
  test("overview loads for an admin", async ({ page }) => {
    await page.goto("/admin/overview");
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 20_000 });
  });

  test("personnel page shows the licence review queue", async ({ page }) => {
    await page.goto("/admin/personnel");
    await expect(page).not.toHaveURL(/\/login/);

    // Either pending applications with a licence link, or an explicit empty
    // state. A blank page means the query broke.
    await expect(
      page.getByRole("link", { name: /licen[cs]e|view/i }).first()
        .or(page.getByText(/no (pending )?applications|nothing to review|empty/i).first())
    ).toBeVisible({ timeout: 20_000 });
  });

  for (const path of ["/admin/contributions", "/admin/domains", "/admin/invite"]) {
    test(`${path} loads`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBeLessThan(400);
      await expect(page).not.toHaveURL(/\/login/);
    });
  }
});

test.describe("doctor pages", () => {
  test("dashboard loads", async ({ page }) => {
    await page.goto("/doctor/dashboard");
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 20_000 });
  });

  test("contribute form renders its fields", async ({ page }) => {
    await page.goto("/doctor/contribute");
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.locator("select, input, textarea").first()).toBeVisible({ timeout: 20_000 });
  });
});

test.describe("doctor application", () => {
  test("requires a licence document before it will submit", async ({ page }) => {
    await page.goto("/doctor-access");

    // An already-approved account sees its status instead of the form; only
    // assert the gate when the form is actually on screen.
    const licence = page.getByText(/medical license|practicing certificate/i);
    if (await licence.count() === 0) {
      test.info().annotations.push({
        type: "note",
        description: "Signed-in account has already applied — form not shown.",
      });
      return;
    }

    await page.getByPlaceholder(/Nigeria/i).fill("Nigeria");
    await page.getByPlaceholder(/University College Hospital/i).fill("UCH Ibadan");
    // The licence is the whole point of the review queue: no file, no submit.
    await expect(page.getByRole("button", { name: /submit application/i })).toBeDisabled();
  });
});

test.describe("convex auth bridge", () => {
  test("mints a token for the signed-in user", async ({ page }) => {
    // The whole RBAC design hangs off this route: it upserts the user in
    // Convex and returns an RS256 token Convex verifies against the JWKS in
    // convex/auth.config.ts. If it 401s, every gated page silently empties.
    await page.goto("/");
    const res = await page.request.get("/api/convex-token");

    expect(res.status()).toBe(200);
    const { token } = await res.json();
    expect(token, "signed out, or CONVEX_JWT_PRIVATE_KEY is unset/malformed").toBeTruthy();

    const [header, payload] = token.split(".").slice(0, 2)
      .map((p: string) => JSON.parse(Buffer.from(p, "base64url").toString()));

    expect(header.alg).toBe("RS256");
    expect(header.kid).toBe("convex-1");
    expect(payload.aud).toBe("afroradiopedia");
    expect(payload.iss).toBe("https://afroradiopedia.app");
    expect(payload.exp).toBeGreaterThan(Date.now() / 1000);
  });
});
