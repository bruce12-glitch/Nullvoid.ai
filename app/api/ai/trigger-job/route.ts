import { NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";
import { getCurrentProjectIdentity, getAccessibleProject } from "@/lib/project-access";
import { generateArchitecture } from "@/trigger/generate-architecture";
import { verifyTriggerEnv } from "@/lib/trigger";

export async function POST(req: Request) {
  try {
    const identity = await getCurrentProjectIdentity();
    if (!identity.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    verifyTriggerEnv();

    const body = await req.json();
    const { prompt, projectId, canvasId } = body;

    if (!prompt || !projectId || !canvasId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const project = await getAccessibleProject(projectId, identity)
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })

    // The Liveblocks room (canvasId) is the project id — require them to
    // match so AI output is always written into the user's own project room.
    if (canvasId !== project.id) {
      return NextResponse.json({ error: "Room does not belong to this project" }, { status: 403 });
    }

    const run = await tasks.trigger<typeof generateArchitecture>(
      "generate-architecture",
      {
        prompt,
        projectId,
        canvasId,
        userId: identity.userId,
      }
    );

    return NextResponse.json({ success: true, runId: run.id });
  } catch (error: unknown) {
    console.error("Failed to trigger background job:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
