import { NextRequest, NextResponse } from "next/server";
import { getCurrentProjectIdentity, userHasProjectAccess } from "@/lib/project-access";
import { generateDeltaPatches } from "@/lib/ai/iterative-generator";
import { rateLimit, rateLimitResponse, clampPrompt, AI_LIMITS } from "@/lib/rate-limit";
import type { CanvasNode, CanvasEdge } from "@/types/canvas";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const identity = await getCurrentProjectIdentity();
  if (!identity.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const b = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const prompt = typeof b.prompt === "string" ? clampPrompt(b.prompt.trim()) : "";
  const projectId = typeof b.projectId === "string" ? b.projectId.trim() : "";
  const nodes = (Array.isArray(b.nodes) ? b.nodes : []).slice(0, AI_LIMITS.maxNodes);
  const edges = (Array.isArray(b.edges) ? b.edges : []).slice(0, AI_LIMITS.maxEdges);

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

  const limit = rateLimit(`chat-modify:${identity.userId}`, 10);
  if (limit.limited) return rateLimitResponse(limit);

  try {
    const result = await generateDeltaPatches(prompt, nodes as CanvasNode[], edges as CanvasEdge[]);
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Delta patch generation failed:", error);
    const status = (error as { statusCode?: number })?.statusCode;
    if (status === 429 || status === 503) {
      return NextResponse.json(
        { error: "The AI model is currently overloaded. Please try again shortly." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "AI request failed. Please try again." }, { status: 500 });
  }
}
