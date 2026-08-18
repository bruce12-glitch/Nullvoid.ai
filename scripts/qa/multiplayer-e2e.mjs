import { chromium } from "@playwright/test";
import { readFileSync } from "fs";

const tokenA = readFileSync("/tmp/tokenA.txt", "utf8").trim();
const tokenB = readFileSync("/tmp/tokenB.txt", "utf8").trim();
const ROOM = "ai-e2e-1";
const BASE = "http://localhost:3000";

const browser = await chromium.launch();

async function signIn(name, token) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/sign-in?__clerk_ticket=${token}`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(6000); // let Clerk consume the ticket + redirect
  const url = page.url();
  console.log(`${name} after ticket sign-in: ${url.includes("/sign-in") ? "STILL ON SIGN-IN ✗" : "✓ signed in -> " + new URL(url).pathname}`);
  return { ctx, page };
}

console.log("1. Signing in both users via Clerk tickets...");
const A = await signIn("User A (owner)", tokenA);
const B = await signIn("User B (teammate)", tokenB);

console.log("2. Owner invites teammate as collaborator...");
const invite = await A.page.evaluate(async () => {
  const r = await fetch("/api/projects/ai-e2e-1/collaborators", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "teammate+clerk_test@nullvoid.dev" }),
  });
  return r.status;
});
console.log(`   invite status: ${invite} (201=new, 409=already added)`);

console.log("3. Both users open the SAME project room...");
await A.page.goto(`${BASE}/editor/${ROOM}`, { waitUntil: "networkidle", timeout: 60000 });
await B.page.goto(`${BASE}/editor/${ROOM}`, { waitUntil: "networkidle", timeout: 60000 });
await A.page.waitForTimeout(8000);
await B.page.waitForTimeout(8000);

const nodesA = await A.page.locator(".react-flow__node").count();
const nodesB = await B.page.locator(".react-flow__node").count();
console.log(`   canvas loaded — A sees ${nodesA} nodes, B sees ${nodesB} nodes`);

console.log("4. LIVE SYNC TEST: A drops a new shape — does it appear on B's screen?");
await A.page.evaluate(() => {
  const pane = document.querySelector(".react-flow");
  const dt = new DataTransfer();
  dt.setData("application/ghost-shape", JSON.stringify({ shape: "circle", size: { width: 100, height: 100 } }));
  const rect = pane.getBoundingClientRect();
  const opts = { bubbles: true, cancelable: true, clientX: rect.left + 640, clientY: rect.top + 400 };
  const drop = new DragEvent("drop", opts);
  Object.defineProperty(drop, "dataTransfer", { value: dt });
  pane.dispatchEvent(drop);
});
await A.page.waitForTimeout(1000);
const nodesA2 = await A.page.locator(".react-flow__node").count();
let nodesB2 = nodesB;
try {
  await B.page.waitForFunction(
    (expected) => document.querySelectorAll(".react-flow__node").length >= expected,
    nodesA2, { timeout: 20000, polling: 1000 }
  );
  nodesB2 = await B.page.locator(".react-flow__node").count();
} catch { nodesB2 = await B.page.locator(".react-flow__node").count(); }
console.log(`   A: ${nodesA} -> ${nodesA2} | B: ${nodesB} -> ${nodesB2} ${nodesB2 > nodesB ? "✓✓✓ REALTIME SYNC WORKS" : "✗ no sync"}`);

console.log("5. Presence: does each user see the other?");
const othersA = await A.page.evaluate(() => document.body.innerText.match(/1 online|2 online|online/i)?.[0] ?? null);
// collaborator avatars component renders others' initials
const avatarsA = await A.page.locator("[title*='Team'], [aria-label*='Team'], img[alt*='Team']").count();
await A.page.screenshot({ path: "/home/user/qa-shots/multiplayer-A.png" });
await B.page.screenshot({ path: "/home/user/qa-shots/multiplayer-B.png" });
console.log(`   presence text on A: ${othersA} | teammate avatar elements: ${avatarsA}`);

await browser.close();
