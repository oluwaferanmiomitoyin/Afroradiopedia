import { test, expect } from "@playwright/test";

// Contract checks on the /api/analyze route that need neither the diagnostic
// engine nor a Convex write. The full path is exercised in live.spec.ts.

test.describe("/api/analyze", () => {
  test("rejects a request with no image", async ({ request }) => {
    const res = await request.post("/api/analyze", {
      data: { scanType: "chest_xray" },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/imageUrl/i);
  });

  test("rejects a request with no scan type", async ({ request }) => {
    const res = await request.post("/api/analyze", {
      data: { imageUrl: "https://example.com/scan.png" },
    });
    expect(res.status()).toBe(400);
  });

  test("does not leak engine internals when the engine is down", async ({ request }) => {
    // With no engine running this takes the failure path. The user-facing
    // error must stay generic — upstream URLs, keys and stack traces are for
    // the server log, not the browser.
    const res = await request.post("/api/analyze", {
      data: {
        imageUrl: "https://example.com/scan.png",
        scanType: "chest_xray",
        engine: "gemini",
      },
      timeout: 60_000,
    });

    if (res.ok()) {
      test.info().annotations.push({
        type: "note",
        description: "An engine answered — AI_SERVICE_URL points at something live.",
      });
      return;
    }

    expect(res.status()).toBe(500);
    const body = await res.text();
    expect(body).not.toMatch(/X-API-Key|GEMINI_API_KEY|onrender|hf\.space|localhost:8000/i);
  });
});
