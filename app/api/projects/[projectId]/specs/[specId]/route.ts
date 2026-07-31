import { prisma } from "@/lib/prisma"
import { getCurrentProjectIdentity, userHasProjectAccess } from "@/lib/project-access"
import type { NextRequest } from "next/server"

export async function GET(
  _request: NextRequest,
  ctx: { params: Promise<{ projectId: string; specId: string }> }
) {
  const identity = await getCurrentProjectIdentity()
  if (!identity.userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId, specId } = await ctx.params

  const hasAccess = await userHasProjectAccess(projectId, identity)
  if (!hasAccess) return Response.json({ error: "Not found" }, { status: 404 })

  const record = await prisma.projectSpec.findFirst({
    where: { id: specId, projectId },
  })

  if (!record) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  return Response.json({ id: record.id, filePath: record.filePath, createdAt: record.createdAt })
}
