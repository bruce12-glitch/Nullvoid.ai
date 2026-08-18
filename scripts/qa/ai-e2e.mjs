import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message.slice(0, 150)));

console.log("1. Opening editor...");
await page.goto("http://localhost:3000/editor/ai-e2e-1", { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(3000);

console.log("2. Typing prompt into AI Architect...");
const textarea = page.locator('textarea[placeholder*="Describe"]').first();
await textarea.fill("Design a simple todo app backend with API, auth and database");
await page.keyboard.press("Enter");

console.log("3. Waiting for AI to place nodes on canvas (up to 4 min)...");
try {
  await page.waitForFunction(
    () => document.querySelectorAll(".react-flow__node").length >= 3,
    { timeout: 240000, polling: 2000 }
  );
} catch {
  console.log("   (node wait timed out — checking state anyway)");
}
const nodes = await page.locator(".react-flow__node").count();
const edges = await page.locator(".react-flow__edge").count();
console.log(`   AI RESULT ON CANVAS: ${nodes} nodes, ${edges} edges`);
await page.screenshot({ path: "/home/user/qa-shots/ai-e2e-result.png" });

console.log("4. Checking chat feed for Ghost AI reply...");
const bodyText = await page.locator("body").innerText();
const hasReply = /Ghost AI/i.test(bodyText);
console.log(`   Ghost AI message present: ${hasReply ? "✓" : "✗"}`);

console.log("5. Waiting for autosave, then verifying persistence via API...");
await page.waitForTimeout(4000);
const saved = await page.evaluate(async () => {
  const r = await fetch("/api/projects/ai-e2e-1/canvas");
  const d = await r.json();
  return d.canvas ? { nodes: d.canvas.nodes.length, edges: d.canvas.edges.length } : null;
});
console.log(`   PERSISTED: ${JSON.stringify(saved)}`);

console.log("6. Undo test (solo history)...");
const before = await page.locator(".react-flow__node").count();
await page.keyboard.press("Control+z");
await page.waitForTimeout(1000);
const after = await page.locator(".react-flow__node").count();
console.log(`   nodes before undo: ${before}, after: ${after} ${after !== before ? "✓ undo works" : "(no change)"}`);
await page.keyboard.press("Control+Shift+z");
await page.waitForTimeout(500);

console.log(`\nCLIENT ERRORS DURING ENTIRE FLOW: ${errors.length}`);
errors.slice(0, 3).forEach((e) => console.log("  ✗", e));
await browser.close();
