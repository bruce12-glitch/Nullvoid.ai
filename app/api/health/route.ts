import { NextResponse } from "next/server";
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
  const key = process.env.TRIGGER_SECRET_KEY;
  if (!key) return "skipped (no key)";
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

  const allHealthy = Object.values(services).every((s) => s === "connected");

  return NextResponse.json({
    status: allHealthy ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    services,
  }, { status: allHealthy ? 200 : 503 });
}
