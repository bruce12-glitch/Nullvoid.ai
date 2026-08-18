import { chromium } from "@playwright/test";

const BASE = "http://localhost:3000";
const PID = "browser-qa-1";
const pages = [
  ["landing", "/"],
  ["dashboard", "/dashboard"],
  ["editor-home", "/editor"],
  ["editor-2d", `/editor/${PID}`],
  ["canvas-3d", `/canvas/${PID}`],
  ["sign-in", "/sign-in"],
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
let totalErrors = 0;

for (const [name, path] of pages) {
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(`PAGEERROR: ${e.message.slice(0, 300)}`));
  page.on("console", (m) => {
    if (m.type() === "error") {
      const t = m.text();
      // Ignore network noise for optional externals
      if (!t.includes("favicon") && !t.includes("net::ERR")) errors.push(`CONSOLE: ${t.slice(0, 300)}`);
    }
  });
  try {
    await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(name === "canvas-3d" ? 8000 : 3000); // let canvas/3D mount
    await page.screenshot({ path: `/home/user/qa-shots/${name}.png` });
    console.log(`\n=== ${name} (${path}) ===`);
    console.log(`  title: ${await page.title()}`);
    if (errors.length) {
      totalErrors += errors.length;
      [...new Set(errors)].slice(0, 5).forEach((e) => console.log("  ✗", e));
    } else {
      console.log("  ✓ no client-side errors");
    }
  } catch (e) {
    totalErrors++;
    console.log(`\n=== ${name} FAILED TO LOAD: ${e.message.slice(0, 200)}`);
  }
  await page.close();
}
await browser.close();
console.log(`\nTOTAL ERROR LINES: ${totalErrors}`);
