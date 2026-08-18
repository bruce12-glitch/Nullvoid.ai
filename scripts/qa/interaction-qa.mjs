import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });

// 1. Editor: does the persisted canvas node actually render in React Flow?
let page = await ctx.newPage();
await page.goto("http://localhost:3000/editor/browser-qa-1", { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(4000);
const nodeCount = await page.locator(".react-flow__node").count();
console.log(`React Flow nodes rendered from saved canvas: ${nodeCount} (expect >= 1)`);

// 2. AI sidebar: type into the architect prompt (verify inputs are wired)
const textarea = page.locator("textarea").first();
const hasTextarea = await textarea.count();
if (hasTextarea) {
  await textarea.fill("test prompt");
  console.log("AI prompt textarea: ✓ typeable");
}
await page.close();

// 3. Dashboard: New Project button opens the modal
page = await ctx.newPage();
await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(2000);
await page.getByRole("button", { name: /new project/i }).first().click();
await page.waitForTimeout(1000);
const dialogVisible = await page.locator("[role=dialog], [data-slot=dialog-content]").count();
console.log(`New Project modal opens: ${dialogVisible > 0 ? "✓ yes" : "✗ NO"}`);
await page.screenshot({ path: "/home/user/qa-shots/create-modal.png" });
await page.close();

// 4. Dashboard: project card dropdown opens (the element we just fixed)
page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(2000);
await page.locator("[data-slot=dropdown-menu-trigger]").first().click();
await page.waitForTimeout(800);
const menuOpen = await page.locator("[role=menu], [data-slot=dropdown-menu-content]").count();
console.log(`Project card dropdown opens: ${menuOpen > 0 ? "✓ yes" : "✗ NO"} | errors: ${errors.length}`);
await browser.close();
