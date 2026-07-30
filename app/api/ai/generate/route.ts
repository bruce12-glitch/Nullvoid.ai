import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { tasks } from "@trigger.dev/sdk/v3";
import { designAgent3D } from "@/trigger/design-agent-3d";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { prompt, projectId, roomId } = body;

    if (!prompt || !projectId || !roomId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Since we are using Option A (Architecture context), 
    // we trigger the durable background task rather than running AI directly here.
    const run = await tasks.trigger<typeof designAgent3D>(
      "design-agent-3d",
      {
        prompt,
        projectId,
        roomId,
        userId,
      }
    );

    return NextResponse.json({ success: true, runId: run.id });
  } catch (error: any) {
    console.error("Failed to trigger design agent:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
