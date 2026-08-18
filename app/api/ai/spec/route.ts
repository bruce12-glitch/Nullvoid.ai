import { prisma } from "@/lib/prisma"
import { getCurrentProjectIdentity, getAccessibleProject } from "@/lib/project-access"
import { hasTrigger, hasBlob } from "@/lib/runtime"
import { rateLimit, rateLimitResponse, AI_LIMITS } from "@/lib/rate-limit"
import { generateSpecMarkdown, type SpecChatMessage } from "@/lib/ai/spec-engine"

export const runtime = "nodejs"
export const maxDuration = 120

export async function POST(request: Request) {
  const identity = await getCurrentProjectIdentity()
  if (!identity.userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const body: unknown = await request.json().catch(() => ({}))
  const b = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {}

  const roomId = typeof b.roomId === "string" ? b.roomId.trim() : ""
  const chatHistory = (Array.isArray(b.chatHistory) ? (b.chatHistory as SpecChatMessage[]) : [])
    .slice(-AI_LIMITS.maxChatMessages)
    .filter((m) => m && typeof m.content === "string" && (m.role === "user" || m.role === "assistant"))
    .map((m) => ({ role: m.role, content: m.content.slice(0, AI_LIMITS.chatMessageMaxChars) }))
  const nodes = (Array.isArray(b.nodes) ? b.nodes : []).slice(0, AI_LIMITS.maxNodes)
  const edges = (Array.isArray(b.edges) ? b.edges : []).slice(0, AI_LIMITS.maxEdges)

  if (!roomId) {
    return Response.json({ error: "Missing roomId" }, { status: 400 })
  }

  const project = await getAccessibleProject(roomId, identity)
  if (!project) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  const limit = rateLimit(`spec:${identity.userId}`, 6)
  if (limit.limited) return rateLimitResponse(limit)

  /* FULL mode — Trigger.dev background job */
  if (hasTrigger()) {
    const { tasks } = await import("@trigger.dev/sdk/v3")
    const handle = await tasks.trigger("generate-spec", {
      projectId: project.id,
      roomId,
      chatHistory,
      nodes,
      edges,
    })
    return Response.json({ runId: handle.id }, { status: 201 })
  }

  /* SOLO / inline mode — generate the spec in this request */
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const spec = await generateSpecMarkdown(nodes as any[], edges as any[], chatHistory)

    let filePath = `spec-${Date.now()}.md`
    let content: string | null = spec

    if (hasBlob()) {
      try {
        const { put } = await import("@vercel/blob")
        const blob = await put(`specs/${project.id}/${Date.now()}.md`, spec, {
          access: "private" as never,
          contentType: "text/markdown",
          addRandomSuffix: false,
          allowOverwrite: true,
        })
        filePath = blob.url
        content = null
      } catch {
        // fall back to inline DB storage
      }
    }

    const record = await prisma.projectSpec.create({
      data: { filePath, content, projectId: project.id },
    })

    return Response.json({ inline: true, runId: null, specId: record.id }, { status: 201 })
  } catch (error) {
    console.error("Inline spec generation failed:", error)
    const status = (error as { statusCode?: number })?.statusCode
    if (status === 429 || status === 503) {
      return Response.json(
        { error: "The AI model is currently overloaded. Please try again shortly." },
        { status: 503 }
      )
    }
    return Response.json({ error: "Spec generation failed. Please try again." }, { status: 500 })
  }
}
