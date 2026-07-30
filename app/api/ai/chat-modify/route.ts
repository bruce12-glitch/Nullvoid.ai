import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateDeltaPatches } from "@/lib/ai/iterative-generator";
import { useCanvasStore } from "@/stores/useCanvasStore";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { prompt, nodes, edges } = body as {
    prompt: string;
    nodes: any[];
    edges: any[];
  };

  if (!prompt) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }

  const result = await generateDeltaPatches(prompt, nodes ?? [], edges ?? []);
  return NextResponse.json(result);
}
