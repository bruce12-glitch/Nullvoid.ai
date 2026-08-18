import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.goto("http://localhost:3000/editor/browser-qa-1", { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(5000);
console.log("nodes:", await page.locator(".react-flow__node").count(), "| edges:", await page.locator(".react-flow__edge").count());
console.log("labels:", await page.locator(".react-flow__node").allTextContents());
await page.screenshot({ path: "/home/user/qa-shots/editor-with-nodes.png" });
await browser.close();
