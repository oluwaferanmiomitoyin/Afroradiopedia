// Records a real Google sign-in once so the authenticated suite can reuse it.
//
//   npm run e2e:login
//
// A browser opens on /login. Sign in with Google as an ADMIN account (one of
// the addresses in the Convex ADMIN_EMAILS variable), wait until you land on
// the dashboard, then press Enter in this terminal.
//
// The saved session lands in e2e/.auth/admin.json, which is gitignored — it
// is a live session for a real account, so it must never be committed.
// Google sessions expire; re-run this when the authenticated suite starts
// failing on redirects to /login.

import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const outFile = path.join(dir, ".auth/admin.json");
const baseUrl = process.env.E2E_BASE_URL ?? "http://localhost:3000";

fs.mkdirSync(path.dirname(outFile), { recursive: true });

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext();
const page = await context.newPage();

await page.goto(`${baseUrl}/login`);

console.log(`\n  Sign in with Google in the browser window.`);
console.log(`  When you are logged in and on a dashboard, press Enter here.\n`);

await new Promise((resolve) => process.stdin.once("data", resolve));

await context.storageState({ path: outFile });
await browser.close();

console.log(`  Saved session to ${path.relative(process.cwd(), outFile)}`);
process.exit(0);
