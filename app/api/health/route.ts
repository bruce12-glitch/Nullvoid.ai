import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";

async function checkLiveblocks(): Promise<string> {
  const key = process.env.LIVEBLOCKS_SECRET_KEY;
  if (!key) return "skipped (no key)";
  try {
    const res = await fetch("https://api.liveblocks.io/v1/rooms?limit=1", {
      headers: { Authorization: `Bearer ${key}` },
    });
    return res.ok ? "connected" : `error (${res.status})`;
  } catch {
    return "unreachable";
  }
}

async function checkTriggerDev(): Promise<string> {
  // The public REST API (e.g. GET /v1/runs) requires a public API key
  // (tr_pub_...). The secret key only works for the private SDK endpoints
  // and would return 401 here.
  const key = process.env.NEXT_PUBLIC_TRIGGER_PUBLIC_KEY;
  if (!key || key.includes("...")) return "skipped (no key)";
  try {
    const res = await fetch("https://api.trigger.dev/v1/runs?limit=1", {
      headers: { Authorization: `Bearer ${key}` },
    });
    return res.ok ? "connected" : `error (${res.status})`;
  } catch {
    return "unreachable";
  }
}

export async function GET() {
  const services: Record<string, string> = {};

  try {
    await prisma.$queryRaw`SELECT 1`;
    services.database = "connected";
  } catch (error) {
    services.database = `error: ${error instanceof Error ? error.message : "unknown"}`;
  }

  services.liveblocks = await checkLiveblocks();
  services.trigger = await checkTriggerDev();

  const allHealthy = Object.values(services).every((s) => s === "connected" || s.startsWith("skipped"));

  return NextResponse.json({
    status: allHealthy ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    services,
  }, { status: allHealthy ? 200 : 503 });
}
