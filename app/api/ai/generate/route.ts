import { NextResponse } from "next/server";
import { getCurrentProjectIdentity, getAccessibleProject } from "@/lib/project-access";
import { hasTrigger } from "@/lib/runtime";
import { rateLimit, rateLimitResponse, clampPrompt } from "@/lib/rate-limit";
import { generateArchitectureSpec } from "@/lib/ai/spec-generator";

export const runtime = "nodejs";
export const maxDuration = 120;

/**
 * POST /api/ai/generate — 3D design agent.
 * FULL mode: dispatches the `design-agent-3d` Trigger.dev task (writes to
 * the Liveblocks room). SOLO mode: generates inline and returns the result
 * for the client to apply locally.
 */
export async function POST(req: Request) {
  try {
    const identity = await getCurrentProjectIdentity();
    if (!identity.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const b = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
    const prompt = typeof b.prompt === "string" ? clampPrompt(b.prompt.trim()) : "";
    const projectId = typeof b.projectId === "string" ? b.projectId.trim() : "";
    const roomId = typeof b.roomId === "string" ? b.roomId.trim() : "";

    if (!prompt || !projectId || !roomId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const project = await getAccessibleProject(projectId, identity);
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // The Liveblocks room is the project id — require them to match so AI
    // output is always written into the project the user actually owns/edits.
    if (roomId !== project.id) {
      return NextResponse.json({ error: "Room does not belong to this project" }, { status: 403 });
    }

    const limit = rateLimit(`generate:${identity.userId}`, 10);
    if (limit.limited) return rateLimitResponse(limit);

    /* FULL mode — background job */
    if (hasTrigger()) {
      const { tasks } = await import("@trigger.dev/sdk/v3");
      const run = await tasks.trigger("design-agent-3d", {
        prompt,
        projectId,
        roomId,
        userId: identity.userId,
      });
      return NextResponse.json({ success: true, runId: run.id });
    }

    /* SOLO mode — generate inline and return the architecture */
    const result = await generateArchitectureSpec(prompt, "The canvas is currently empty.");
    return NextResponse.json({
      success: true,
      inline: true,
      runId: null,
      overview: result.overview,
      nodes: result.nodes,
      edges: result.edges,
      specification: result.specification,
    });
  } catch (error: unknown) {
    console.error("Failed to run design agent:", error);
    const status = (error as { statusCode?: number })?.statusCode;
    if (status === 429 || status === 503) {
      return NextResponse.json(
        { error: "The AI model is currently overloaded. Please try again shortly." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
