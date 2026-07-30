import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import type { NextRequest } from "next/server"

type RouteContext = { params: Promise<{ projectId: string }> }

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext
) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await ctx.params

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return Response.json({ error: "Not found" }, { status: 404 })
  if (project.userId !== userId) return Response.json({ error: "Forbidden" }, { status: 403 })

  const body: unknown = await request.json().catch(() => ({}))
  const title =
    typeof body === "object" && body !== null && "title" in body && typeof (body as { title: unknown }).title === "string"
      ? (body as { title: string }).title.trim()
      : undefined

  if (!title) return Response.json({ error: "title is required" }, { status: 400 })

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: { title },
  })

  return Response.json({ project: updated })
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext
) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await ctx.params

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return Response.json({ error: "Not found" }, { status: 404 })
  if (project.userId !== userId) return Response.json({ error: "Forbidden" }, { status: 403 })

  await prisma.project.delete({ where: { id: projectId } })

  return new Response(null, { status: 204 })
}
