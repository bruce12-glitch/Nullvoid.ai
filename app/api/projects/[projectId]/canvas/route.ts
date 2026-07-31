import { prisma } from "@/lib/prisma"
import { getCurrentProjectIdentity, userHasProjectAccess } from "@/lib/project-access"
import { put, get } from "@vercel/blob"
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

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, ownerId: true, canvasBlobUrl: true },
    })
    const stored = project?.canvasBlobUrl ?? null

    // Never stored a canvas (or a legacy literal "null" string).
    if (!stored || stored === "null") {
      return Response.json({ canvas: null })
    }

    // Legacy inline value (e.g. a template name or raw JSON that was saved
    // before blob serialization existed). Try to parse it as canvas JSON.
    if (!stored.startsWith("http")) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          return Response.json({ canvas: parsed })
        }
      } catch {
        // Not JSON — treat as "no canvas".
      }
      return Response.json({ canvas: null })
    }

    // Stored blob URL: fetch the content server-side using the blob SDK so
    // private blobs are authenticated with BLOB_READ_WRITE_TOKEN.
    const result = await get(stored, { access: "private" })
    if (!result || result.statusCode !== 200 || !result.stream) {
      return Response.json({ canvas: null })
    }

    const text = await new Response(result.stream).text()
    const parsed = JSON.parse(text)
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return Response.json({ canvas: parsed })
    }
    return Response.json({ canvas: null })
  } catch {
    return Response.json({ canvas: null })
  }
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

  const body = await request.json().catch(() => null)

  let stored: string | null = null

  if (typeof body === "string") {
    // Legacy: raw blob URL string.
    stored = body
  } else if (body && typeof body === "object") {
    const b = body as Record<string, unknown>

    // Legacy: { url } or { canvasBlobUrl }.
    const legacyUrl =
      typeof b.url === "string" ? b.url :
      typeof b.canvasBlobUrl === "string" ? b.canvasBlobUrl :
      null
    if (legacyUrl) {
      stored = legacyUrl
    } else {
      // Modern contract: { nodes, edges } — serialize to a private blob and
      // persist the URL so the canvas actually survives reloads.
      const nodes = Array.isArray(b.nodes) ? b.nodes : undefined
      const edges = Array.isArray(b.edges) ? b.edges : undefined
      if (nodes !== undefined || edges !== undefined) {
        const blob = await put(
          `canvases/${projectId}/${Date.now()}-canvas.json`,
          JSON.stringify({ nodes: nodes ?? [], edges: edges ?? [] }),
          {
            access: "private",
            contentType: "application/json",
            addRandomSuffix: false,
            allowOverwrite: true,
          }
        )
        stored = blob.url
      }
    }
  }

  // Nothing to persist (empty/no-op request) — keep the existing value.
  if (!stored || stored === "null") {
    return Response.json({ ok: true })
  }

  try {
    await prisma.project.update({
      where: { id: projectId },
      data: { canvasBlobUrl: stored },
    })
    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: "Failed to save canvas" }, { status: 500 })
  }
}
