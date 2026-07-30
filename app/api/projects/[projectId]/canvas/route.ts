import { prisma } from "@/lib/prisma"
import { getCurrentProjectIdentity, userHasProjectAccess } from "@/lib/project-access"
import type { NextRequest } from "next/server"

// Next.js app router route context types
type RouteContext = {
  params: Promise<{ projectId: string }>
}

export async function GET(
  _request: NextRequest,
  ctx: RouteContext
) {
  const identity = await getCurrentProjectIdentity()
  if (!identity.userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await ctx.params
  const hasAccess = await userHasProjectAccess(projectId, identity)
  if (!hasAccess) return Response.json({ error: "Not found" }, { status: 404 })

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, userId: true, canvasData: true },
  })

  if (!project) return Response.json({ canvas: null })

  return Response.json({ canvas: project.canvasData ?? {} })
}

export async function PUT(
  request: NextRequest,
  ctx: RouteContext
) {
  const identity = await getCurrentProjectIdentity()
  if (!identity.userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await ctx.params
  const hasAccess = await userHasProjectAccess(projectId, identity)
  if (!hasAccess) return Response.json({ error: "Not found" }, { status: 404 })

  const body: unknown = await request.json().catch(() => ({}))

  await prisma.project.update({
    where: { id: projectId },
    data: { canvasData: body as any },
  })

  return Response.json({ ok: true })
}
