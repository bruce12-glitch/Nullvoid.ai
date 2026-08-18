import { getCurrentProjectIdentity } from "@/lib/project-access"
import { hasTrigger } from "@/lib/runtime"

export async function POST(request: Request) {
  const identity = await getCurrentProjectIdentity()
  if (!identity.userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  if (!hasTrigger()) {
    // Inline mode has no background run to subscribe to.
    return Response.json({ token: null, inline: true })
  }

  const body: unknown = await request.json().catch(() => ({}))
  const b = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {}
  const runId = typeof b.runId === "string" ? b.runId.trim() : ""

  if (!runId) return Response.json({ error: "Missing runId" }, { status: 400 })

  const { auth: triggerAuth } = await import("@trigger.dev/sdk/v3")
  const token = await triggerAuth.createPublicToken({
    scopes: { read: { runs: [runId] } },
    expirationTime: "1h",
  })

  return Response.json({ token })
}
