import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message.slice(0, 200)));
const results = [];
const ok = (name, pass, extra = "") => { results.push(`${pass ? "✓" : "✗"} ${name} ${extra}`); };

await page.goto("http://localhost:3000/editor/ai-e2e-1", { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(4000);

// Close the floating Projects panel so it doesn't intercept canvas clicks
const projectsPanel = page.locator("aside").filter({ hasText: "Projects" }).first();
if (await projectsPanel.count()) {
  const closeBtn = projectsPanel.getByRole("button").first();
  await closeBtn.click().catch(() => {});
  await page.waitForTimeout(600);
}
// Fit the view so nodes sit in the open canvas area
const fitBtn = page.locator('button[title*="it view" i], .react-flow__controls-fitview').first();
if (await fitBtn.count()) { await fitBtn.click().catch(() => {}); await page.waitForTimeout(600); }

/* ---- 1. Node label edit (solo mock-CRDT nested path write) ---- */
const firstNode = page.locator(".react-flow__node").nth(1);
const beforeLabel = (await firstNode.innerText()).trim();
await firstNode.dblclick();
await page.waitForTimeout(600);
const editable = page.locator('[contenteditable="true"]').first();
if (await editable.count()) {
  await editable.fill ? null : null;
  await page.keyboard.press("Control+a");
  await page.keyboard.type("Renamed Node QA");
  await page.locator(".react-flow__pane").click({ position: { x: 600, y: 700 } });
  await page.waitForTimeout(800);
  const afterLabel = (await firstNode.innerText()).trim();
  ok("Node label inline edit", afterLabel.includes("Renamed Node QA"), `("${beforeLabel}" -> "${afterLabel}")`);
} else {
  ok("Node label inline edit", false, "(no contenteditable appeared)");
}

/* ---- 2. Drag-drop a shape onto the canvas ---- */
const nodesBefore = await page.locator(".react-flow__node").count();
const dropWorked = await page.evaluate(() => {
  const pane = document.querySelector(".react-flow");
  if (!pane) return false;
  const dt = new DataTransfer();
  dt.setData("application/ghost-shape", JSON.stringify({ shape: "hexagon", size: { width: 140, height: 120 } }));
  const rect = pane.getBoundingClientRect();
  const opts = { bubbles: true, cancelable: true, clientX: rect.left + 450, clientY: rect.top + 500 };
  pane.dispatchEvent(Object.assign(new DragEvent("dragover", opts), {}));
  const drop = new DragEvent("drop", opts);
  Object.defineProperty(drop, "dataTransfer", { value: dt });
  pane.dispatchEvent(drop);
  return true;
});
await page.waitForTimeout(1200);
const nodesAfterDrop = await page.locator(".react-flow__node").count();
ok("Drag-drop shape onto canvas", dropWorked && nodesAfterDrop === nodesBefore + 1, `(${nodesBefore} -> ${nodesAfterDrop})`);

/* ---- 3. Share dialog opens ---- */
await page.getByRole("button", { name: /^share$/i }).first().click();
await page.waitForTimeout(1200);
const shareOpen = await page.locator("[role=dialog], [data-slot=dialog-content]").count();
ok("Share dialog opens", shareOpen > 0);
await page.keyboard.press("Escape");
await page.waitForTimeout(600);

/* ---- 4. Templates modal + import ---- */
await page.getByRole("button", { name: /templates/i }).first().click();
await page.waitForTimeout(1200);
const tmplModal = await page.locator("[role=dialog], [data-slot=dialog-content]").count();
ok("Templates modal opens", tmplModal > 0);
await page.screenshot({ path: "/home/user/qa-shots/templates-modal.png" });
// click the first template import button inside the modal
const importBtn = page.locator("[role=dialog] button, [data-slot=dialog-content] button").filter({ hasText: /use|import|template/i }).first();
if (await importBtn.count()) {
  await importBtn.click();
  await page.waitForTimeout(1500);
  const nodesAfterTmpl = await page.locator(".react-flow__node").count();
  ok("Template import replaces canvas", nodesAfterTmpl > 0 && nodesAfterTmpl !== nodesAfterDrop, `(now ${nodesAfterTmpl} nodes)`);
} else {
  ok("Template import", false, "(no import button found)");
}
await page.keyboard.press("Escape");

/* ---- 5. Spec generation through the UI (Specs tab) ---- */
await page.getByRole("tab", { name: /specs/i }).first().click();
await page.waitForTimeout(800);
await page.getByRole("button", { name: /generate spec/i }).first().click();
console.log("   generating spec via UI (inline, up to 3 min)...");
try {
  await page.waitForSelector("text=/spec-.*\\.md/i", { timeout: 180000 });
  ok("Spec generated via UI + appears in list", true);
} catch {
  ok("Spec generated via UI + appears in list", false, "(timed out)");
}
await page.screenshot({ path: "/home/user/qa-shots/specs-tab.png" });

console.log("\n===== DEEP INTERACTION QA =====");
results.forEach((r) => console.log(" ", r));
console.log(`\nCLIENT ERRORS: ${errors.length}`);
errors.slice(0, 5).forEach((e) => console.log("  ✗", e));
await browser.close();
