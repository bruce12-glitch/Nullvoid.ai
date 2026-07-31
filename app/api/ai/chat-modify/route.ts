import { NextRequest, NextResponse } from "next/server";
import { getCurrentProjectIdentity, userHasProjectAccess } from "@/lib/project-access";
import { generateDeltaPatches } from "@/lib/ai/iterative-generator";
import type { CanvasNode, CanvasEdge } from "@/types/canvas";
export const runtime = "nodejs";
export const maxDuration = 60;

// Simple in-memory sliding-window rate limit per user. This is per-serverless
// instance, so it is a coarse guard against unbounded Gemini token burn rather
// than a hard global limit.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;
const hitCounts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const entry = hitCounts.get(userId);
  if (!entry || now >= entry.resetAt) {
    hitCounts.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

export async function POST(req: NextRequest) {
  const identity = await getCurrentProjectIdentity();
  if (!identity.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const b = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const prompt = typeof b.prompt === "string" ? b.prompt.trim() : "";
  const projectId = typeof b.projectId === "string" ? b.projectId.trim() : "";
  const nodes = Array.isArray(b.nodes) ? b.nodes : [];
  const edges = Array.isArray(b.edges) ? b.edges : [];

  if (!prompt) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }

  // Bind the request to a project the user actually owns/edits so an
  // authenticated user can't burn unlimited Gemini tokens anonymously.
  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  const hasAccess = await userHasProjectAccess(projectId, identity);
  if (!hasAccess) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (isRateLimited(identity.userId)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again in a minute." },
      { status: 429 }
    );
  }

  const result = await generateDeltaPatches(prompt, nodes as CanvasNode[], edges as CanvasEdge[]);
  return NextResponse.json(result);
}
