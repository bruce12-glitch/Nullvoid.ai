import { getCurrentProjectIdentity, getAccessibleProject } from "@/lib/project-access"
import { verifyTriggerEnv } from "@/lib/trigger"
import { tasks } from "@trigger.dev/sdk/v3"
import type { designAgent } from "@/trigger/design-agent"

export async function POST(request: Request) {
  const identity = await getCurrentProjectIdentity()
  if (!identity.userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const body: unknown = await request.json().catch(() => ({}))
  const b = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {}
  const prompt = typeof b.prompt === "string" ? b.prompt.trim() : ""
  const roomId = typeof b.roomId === "string" ? b.roomId.trim() : ""
  const projectId = typeof b.projectId === "string" ? b.projectId.trim() : ""

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

  verifyTriggerEnv()

  const handle = await tasks.trigger<typeof designAgent>("design-agent", { prompt, roomId, userId: identity.userId })

  return Response.json({ runId: handle.id }, { status: 201 })
}
