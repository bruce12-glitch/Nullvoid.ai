import { getCurrentProjectIdentity } from "@/lib/project-access"
import { prisma } from "@/lib/prisma"
import type { NextRequest } from "next/server"

type RouteContext = { params: Promise<{ projectId: string }> }

const NAME_MAX = 120
const DESCRIPTION_MAX = 500
const VALID_STATUSES = ["DRAFT", "ARCHIVED"] as const

async function requireOwnedProject(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return { error: Response.json({ error: "Not found" }, { status: 404 }) }
  if (project.ownerId !== userId) {
    return { error: Response.json({ error: "Only the project owner can do this" }, { status: 403 }) }
  }
  return { project }
}

/**
 * GET /api/projects/[projectId] — project metadata (owner or collaborator).
 */
export async function GET(_request: NextRequest, ctx: RouteContext) {
  const identity = await getCurrentProjectIdentity()
  if (!identity.userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await ctx.params

  try {
    const { getAccessibleProject } = await import("@/lib/project-access")
    const project = await getAccessibleProject(projectId, identity)
    if (!project) return Response.json({ error: "Not found" }, { status: 404 })
    return Response.json({ project })
  } catch {
    return Response.json({ error: "Failed to fetch project" }, { status: 500 })
  }
}

/**
 * PATCH /api/projects/[projectId] — rename / edit a project (owner only).
 * Accepts `name` (canonical) or `title` (legacy), optional `description`
 * and `status` ("DRAFT" | "ARCHIVED").
 */
export async function PATCH(request: NextRequest, ctx: RouteContext) {
  const { userId } = await getCurrentProjectIdentity()
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await ctx.params

  try {
    const check = await requireOwnedProject(projectId, userId)
    if ("error" in check) return check.error
  } catch {
    return Response.json({ error: "Failed to access project" }, { status: 500 })
  }

  const body: unknown = await request.json().catch(() => ({}))
  const b = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {}

  const rawName =
    typeof b.name === "string" && b.name.trim() ? b.name :
    typeof b.title === "string" && b.title.trim() ? b.title :
    undefined
  const name = rawName?.trim().slice(0, NAME_MAX)

  const description =
    typeof b.description === "string" ? b.description.trim().slice(0, DESCRIPTION_MAX) : undefined

  const status =
    typeof b.status === "string" && (VALID_STATUSES as readonly string[]).includes(b.status)
      ? (b.status as (typeof VALID_STATUSES)[number])
      : undefined

  if (name === undefined && description === undefined && status === undefined) {
    return Response.json(
      { error: "Nothing to update — provide name, description or status" },
      { status: 400 }
    )
  }

  try {
    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description: description || null } : {}),
        ...(status !== undefined ? { status } : {}),
      },
    })
    return Response.json({ project: updated })
  } catch {
    return Response.json({ error: "Failed to update project" }, { status: 500 })
  }
}

/**
 * DELETE /api/projects/[projectId] — delete a project (owner only).
 * Cascades to collaborators and specs via Prisma schema.
 */
export async function DELETE(_request: NextRequest, ctx: RouteContext) {
  const { userId } = await getCurrentProjectIdentity()
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await ctx.params

  try {
    const check = await requireOwnedProject(projectId, userId)
    if ("error" in check) return check.error
  } catch {
    return Response.json({ error: "Failed to access project" }, { status: 500 })
  }

  try {
    await prisma.project.delete({ where: { id: projectId } })
    return new Response(null, { status: 204 })
  } catch {
    return Response.json({ error: "Failed to delete project" }, { status: 500 })
  }
}
