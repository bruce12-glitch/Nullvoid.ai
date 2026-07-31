import { prisma } from "@/lib/prisma"
import { getCurrentProjectIdentity, userHasProjectAccess } from "@/lib/project-access"
import { get } from "@vercel/blob"
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

  let content: string
  if (record.filePath.startsWith("http")) {
    // Specs are stored as private blobs — fetch with the blob SDK so the
    // read-write token authenticates the request (a plain fetch would 401/403).
    try {
      const result = await get(record.filePath, { access: "private" })
      if (!result || result.statusCode !== 200 || !result.stream) {
        return Response.json({ error: "Spec content unavailable" }, { status: 502 })
      }
      content = await new Response(result.stream).text()
    } catch {
      return Response.json({ error: "Spec content unavailable" }, { status: 502 })
    }
  } else {
    // Legacy plain-text filePath (e.g. "generation-in-progress").
    content = record.filePath
  }

  return new Response(content, {
    status: 200,
    headers: {
      "Content-Disposition": `attachment; filename="spec-${record.id}.md"`,
      "Content-Type": "text/markdown",
    },
  })
}
