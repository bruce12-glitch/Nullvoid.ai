import { getCurrentProjectIdentity } from "@/lib/project-access"
import { prisma } from "@/lib/prisma"
import type { NextRequest } from "next/server"

type RouteContext = { params: Promise<{ projectId: string }> }

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext
) {
  const { userId } = await getCurrentProjectIdentity()
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await ctx.params

  try {
    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) return Response.json({ error: "Not found" }, { status: 404 })
    if (project.ownerId !== userId) return Response.json({ error: "Forbidden" }, { status: 403 })
  } catch {
    return Response.json({ error: "Failed to access project" }, { status: 500 })
  }

  const body: unknown = await request.json().catch(() => ({}))
  const name =
    typeof body === "object" && body !== null && "title" in body && typeof (body as { title: unknown }).title === "string"
      ? (body as { title: string }).title.trim()
      : undefined

  if (!name) return Response.json({ error: "title is required" }, { status: 400 })

  try {
    const updated = await prisma.project.update({
      where: { id: projectId },
      data: { name },
    })
    return Response.json({ project: updated })
  } catch {
    return Response.json({ error: "Failed to update project" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext
) {
  const { userId } = await getCurrentProjectIdentity()
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await ctx.params

  try {
    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) return Response.json({ error: "Not found" }, { status: 404 })
    if (project.ownerId !== userId) return Response.json({ error: "Forbidden" }, { status: 403 })
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
