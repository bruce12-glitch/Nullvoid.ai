import { getCurrentProjectIdentity } from "@/lib/project-access"
import { getProjectsForUser } from "@/lib/projects"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/projects — projects the user owns plus projects shared with them.
 * Response keeps the legacy `projects` field (owned) for backwards
 * compatibility and adds `shared`.
 */
export async function GET() {
  const identity = await getCurrentProjectIdentity()
  if (!identity.userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { owned, shared } = await getProjectsForUser(identity.userId, identity.primaryEmailAddress)
    return Response.json({ projects: owned, shared })
  } catch {
    return Response.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}

const PROJECT_ID_RE = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/
const NAME_MAX = 120
const DESCRIPTION_MAX = 500

/**
 * POST /api/projects — create a project.
 * Accepts `name` (canonical) or `title` (legacy) plus optional
 * `description` and a custom `id` (room slug).
 */
export async function POST(request: Request) {
  const { userId } = await getCurrentProjectIdentity()
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const body: unknown = await request.json().catch(() => ({}))
  const b = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {}

  const rawName =
    typeof b.name === "string" && b.name.trim() ? b.name :
    typeof b.title === "string" && b.title.trim() ? b.title :
    ""
  const name = (rawName.trim() || "Untitled Project").slice(0, NAME_MAX)

  const description =
    typeof b.description === "string" && b.description.trim()
      ? b.description.trim().slice(0, DESCRIPTION_MAX)
      : undefined

  const id = typeof b.id === "string" && b.id.trim() ? b.id.trim() : undefined
  if (id && !PROJECT_ID_RE.test(id)) {
    return Response.json(
      { error: "Invalid project id — use letters, numbers, dashes or underscores (max 64 chars)" },
      { status: 400 }
    )
  }

  try {
    const project = await prisma.project.create({
      data: {
        ...(id ? { id } : {}),
        ownerId: userId,
        name,
        ...(description ? { description } : {}),
      },
    })
    return Response.json({ project }, { status: 201 })
  } catch (error: unknown) {
    // Unique constraint (custom id already taken) → 409, not a generic 500.
    const code = (error as { code?: string })?.code
    if (code === "P2002") {
      return Response.json({ error: "A project with this id already exists" }, { status: 409 })
    }
    console.error("Failed to create project:", error)
    return Response.json({ error: "Failed to create project" }, { status: 500 })
  }
}
