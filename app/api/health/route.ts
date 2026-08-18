import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { hasClerk, hasLiveblocks, hasTrigger, hasBlob, hasGemini } from "@/lib/runtime";

async function checkLiveblocks(): Promise<string> {
  if (!hasLiveblocks()) return "solo mode (no key)";
  try {
    const res = await fetch("https://api.liveblocks.io/v1/rooms?limit=1", {
      headers: { Authorization: `Bearer ${process.env.LIVEBLOCKS_SECRET_KEY}` },
    });
    return res.ok ? "connected" : `error (${res.status})`;
  } catch {
    return "unreachable";
  }
}

async function checkGemini(): Promise<string> {
  if (!hasGemini()) return "missing key (AI features disabled)";
  const key =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?pageSize=1&key=${key}`,
      { signal: AbortSignal.timeout(5000) }
    );
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

  services.gemini = await checkGemini();
  services.liveblocks = await checkLiveblocks();
  services.auth = hasClerk() ? "clerk" : "solo mode (guest identity)";
  services.backgroundJobs = hasTrigger() ? "trigger.dev" : "inline execution (no Trigger.dev key)";
  services.storage = hasBlob() ? "vercel blob" : "postgres inline (no Blob token)";

  const critical = [services.database, services.gemini];
  const allHealthy = critical.every(
    (s) => s === "connected" || s.startsWith("solo") || s.startsWith("inline")
  );

  return NextResponse.json(
    {
      status: allHealthy ? "healthy" : "degraded",
      mode: hasClerk() && hasLiveblocks() ? "full" : "solo",
      timestamp: new Date().toISOString(),
      services,
    },
    { status: allHealthy ? 200 : 503 }
  );
}
