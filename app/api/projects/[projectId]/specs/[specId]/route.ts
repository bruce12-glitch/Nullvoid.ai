import { prisma } from "@/lib/prisma"
import { getCurrentProjectIdentity, userHasProjectAccess } from "@/lib/project-access"
import type { NextRequest } from "next/server"

/**
 * Returns the Markdown content of a spec as plain text.
 * (The AI sidebar preview renders this directly with react-markdown.)
 */
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

  if (record.content) {
    // Inline DB storage (SOLO mode / blob fallback).
    content = record.content
  } else if (record.filePath.startsWith("http")) {
    // Blob storage — authenticate with the read-write token.
    try {
      const { get } = await import("@vercel/blob")
      const result = await get(record.filePath, { access: "private" })
      if (!result || result.statusCode !== 200 || !result.stream) {
        return Response.json({ error: "Spec content unavailable" }, { status: 502 })
      }
      content = await new Response(result.stream).text()
    } catch {
      return Response.json({ error: "Spec content unavailable" }, { status: 502 })
    }
  } else {
    // Legacy plain-text filePath.
    content = record.filePath
  }

  return new Response(content, {
    status: 200,
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  })
}
