// Usage: pnpm build && pnpm start --port 3100 (in another terminal), then
//        node scripts/capture-thumbs.mjs http://localhost:3100
import { mkdir } from "node:fs/promises";
import { chromium } from "@playwright/test";

const base = process.argv[2] ?? "http://localhost:3100";
const targets = {
  "web-basic": "/demos/sale-page",
  "web-standard": "/demos/company",
  "web-premium": "/demos/resort",
  "app-basic": "/demos/orders-api",
  "app-standard": "/demos/shop-admin",
  "app-premium": "/demos/clinic-booking/book",
};

await mkdir("public/thumbs", { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await context.addInitScript(() => {
  localStorage.setItem("demo:shop-admin:session", "true");
  localStorage.setItem("demo:clinic:session", "true");
});
const page = await context.newPage();
for (const [id, path] of Object.entries(targets)) {
  await page.goto(base + path, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: '[data-testid="demo-pill"]{display:none!important}' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `public/thumbs/${id}.jpg`, type: "jpeg", quality: 82 });
  console.log(`captured ${id}`);
}
await browser.close();
