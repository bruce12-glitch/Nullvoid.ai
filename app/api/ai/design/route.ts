import { getCurrentProjectIdentity, getAccessibleProject } from "@/lib/project-access"
import { hasTrigger, hasLiveblocks } from "@/lib/runtime"
import { rateLimit, rateLimitResponse, clampPrompt, AI_LIMITS } from "@/lib/rate-limit"
import { runDesignAgent, applyDesignActions, buildCanvasContext } from "@/lib/ai/design-engine"
import type { CanvasNode, CanvasEdge } from "@/types/canvas"

export const runtime = "nodejs"
export const maxDuration = 120

export async function POST(request: Request) {
  const identity = await getCurrentProjectIdentity()
  if (!identity.userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const body: unknown = await request.json().catch(() => ({}))
  const b = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {}
  const prompt = typeof b.prompt === "string" ? clampPrompt(b.prompt.trim()) : ""
  const roomId = typeof b.roomId === "string" ? b.roomId.trim() : ""
  const projectId = typeof b.projectId === "string" ? b.projectId.trim() : ""
  // Current canvas state — sent by the client for inline (SOLO) generation.
  const clientNodes = (Array.isArray(b.nodes) ? (b.nodes as CanvasNode[]) : []).slice(0, AI_LIMITS.maxNodes)
  const clientEdges = (Array.isArray(b.edges) ? (b.edges as CanvasEdge[]) : []).slice(0, AI_LIMITS.maxEdges)

  if (!prompt || !roomId || !projectId) {
    return Response.json({ error: "Missing required fields" }, { status: 400 })
  }

  const project = await getAccessibleProject(projectId, identity)
  if (!project) return Response.json({ error: "Not found" }, { status: 404 })

  // The Liveblocks room is the project id. Requiring them to match prevents
  // an authenticated user from triggering writes into another project's room.
  if (roomId !== project.id) {
    return Response.json({ error: "Room does not belong to this project" }, { status: 403 })
  }

  const limit = rateLimit(`design:${identity.userId}`, 10)
  if (limit.limited) return rateLimitResponse(limit)

  /* ------------------------------------------------------------------ */
  /* FULL mode — background job via Trigger.dev + Liveblocks CRDT        */
  /* ------------------------------------------------------------------ */
  if (hasTrigger()) {
    const { tasks } = await import("@trigger.dev/sdk/v3")
    const handle = await tasks.trigger("design-agent", { prompt, roomId, userId: identity.userId })
    return Response.json({ runId: handle.id }, { status: 201 })
  }

  /* ------------------------------------------------------------------ */
  /* SOLO / inline mode — run the same agent directly in this request    */
  /* ------------------------------------------------------------------ */
  try {
    const canvasContext = buildCanvasContext(clientNodes, clientEdges)
    const { actionCalls, summary } = await runDesignAgent(prompt, canvasContext)
    const { nodes, edges } = applyDesignActions(actionCalls, clientNodes, clientEdges)

    // Hybrid mode: Liveblocks configured but no Trigger.dev — apply the
    // result to the shared room server-side so all collaborators see it.
    if (hasLiveblocks()) {
      try {
        const { applyDesignActionsToRoom } = await import("@/lib/ai/design-engine")
        await applyDesignActionsToRoom(roomId, actionCalls)
      } catch (err) {
        console.error("Failed to apply design to Liveblocks room:", err)
      }
    }

    return Response.json(
      { inline: true, runId: null, summary, nodes, edges, actionsApplied: actionCalls.length },
      { status: 201 }
    )
  } catch (error) {
    console.error("Inline design generation failed:", error)
    const status = (error as { statusCode?: number })?.statusCode
    if (status === 429 || status === 503) {
      return Response.json(
        { error: "The AI model is currently overloaded. Please try again shortly." },
        { status: 503 }
      )
    }
    return Response.json({ error: "Design generation failed. Please try again." }, { status: 500 })
  }
}
