import { NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";
import { getCurrentProjectIdentity, getAccessibleProject } from "@/lib/project-access";
import { verifyTriggerEnv } from "@/lib/trigger";
import { designAgent3D } from "@/trigger/design-agent-3d";

export async function POST(req: Request) {
  try {
    const identity = await getCurrentProjectIdentity();
    if (!identity.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { prompt, projectId, roomId } = body;

    if (!prompt || !projectId || !roomId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const project = await getAccessibleProject(projectId, identity)
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })

    // The Liveblocks room is the project id — require them to match so AI
    // output is always written into the project the user actually owns/edits.
    if (roomId !== project.id) {
      return NextResponse.json({ error: "Room does not belong to this project" }, { status: 403 });
    }

    verifyTriggerEnv();

    const run = await tasks.trigger<typeof designAgent3D>(
      "design-agent-3d",
      {
        prompt,
        projectId,
        roomId,
        userId: identity.userId,
      }
    );

    return NextResponse.json({ success: true, runId: run.id });
  } catch (error: unknown) {
    console.error("Failed to trigger design agent:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
