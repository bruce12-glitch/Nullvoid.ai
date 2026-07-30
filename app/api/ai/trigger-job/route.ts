import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { tasks } from "@trigger.dev/sdk/v3";
import { generateArchitecture } from "@/trigger/generate-architecture";
import { verifyTriggerEnv } from "@/lib/trigger";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    verifyTriggerEnv();

    const body = await req.json();
    const { prompt, projectId, canvasId } = body;

    if (!prompt || !projectId || !canvasId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const run = await tasks.trigger<typeof generateArchitecture>(
      "generate-architecture",
      {
        prompt,
        projectId,
        canvasId,
        userId,
      }
    );

    // Return within <200ms to avoid Vercel serverless limits
    return NextResponse.json({ success: true, runId: run.id });
  } catch (error: any) {
    console.error("Failed to trigger background job:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
