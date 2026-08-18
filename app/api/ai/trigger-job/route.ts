import { NextResponse } from "next/server";
import { getCurrentProjectIdentity, getAccessibleProject } from "@/lib/project-access";
import { hasTrigger } from "@/lib/runtime";
import { rateLimit, rateLimitResponse, clampPrompt } from "@/lib/rate-limit";
import { generateArchitectureSpec } from "@/lib/ai/spec-generator";

export const runtime = "nodejs";
export const maxDuration = 120;

/**
 * POST /api/ai/trigger-job — legacy 3D architecture generation entrypoint.
 * FULL mode: dispatches the `generate-architecture` Trigger.dev task.
 * SOLO mode: generates inline and returns the architecture directly.
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
    const canvasId = typeof b.canvasId === "string" ? b.canvasId.trim() : "";

    if (!prompt || !projectId || !canvasId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const project = await getAccessibleProject(projectId, identity);
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // The Liveblocks room (canvasId) is the project id — require them to
    // match so AI output is always written into the user's own project room.
    if (canvasId !== project.id) {
      return NextResponse.json({ error: "Room does not belong to this project" }, { status: 403 });
    }

    const limit = rateLimit(`trigger-job:${identity.userId}`, 10);
    if (limit.limited) return rateLimitResponse(limit);

    /* FULL mode — background job */
    if (hasTrigger()) {
      const { tasks } = await import("@trigger.dev/sdk/v3");
      const run = await tasks.trigger("generate-architecture", {
        prompt,
        projectId,
        canvasId,
        userId: identity.userId,
      });
      return NextResponse.json({ success: true, runId: run.id });
    }

    /* SOLO mode — inline generation */
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
    console.error("Failed to trigger background job:", error);
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
