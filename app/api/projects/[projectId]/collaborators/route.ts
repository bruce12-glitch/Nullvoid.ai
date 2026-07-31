import { clerkClient } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import {
  addCollaborator,
  getProjectCollaborators,
  isValidCollaboratorEmail,
  normalizeCollaboratorEmail,
  removeCollaborator,
} from "@/lib/project-collaborators"
import { getAccessibleProject, getCurrentProjectIdentity } from "@/lib/project-access"
import type { NextRequest } from "next/server"

type RouteContext = { params: Promise<{ projectId: string }> }

interface SharePerson {
  email: string | null
  displayName: string
  avatarUrl: string | null
  role: "owner" | "collaborator"
}

interface SharePayload {
  projectId: string
  projectName: string
  canManage: boolean
  owner: SharePerson
  collaborators: SharePerson[]
}

function deriveDisplayName(email: string) {
  const local = email.split("@")[0] ?? email
  if (!local) return email
  return local.replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).trim() || email
}

async function getOwnerPerson(project: { ownerId: string }) {
  try {
    const client = await clerkClient()
    const owner = await client.users.getUser(project.ownerId)
    const email = owner.primaryEmailAddress?.emailAddress ?? null
    const name = [owner.firstName, owner.lastName].filter(Boolean).join(" ").trim()
    return {
      email,
      displayName: name || (email ? deriveDisplayName(email) : "Workspace owner"),
      avatarUrl: owner.imageUrl || null,
      role: "owner" as const,
    }
  } catch {
    return {
      email: null,
      displayName: "Workspace owner",
      avatarUrl: null,
      role: "owner" as const,
    }
  }
}

async function buildShare(projectId: string): Promise<SharePayload | null> {
  const identity = await getCurrentProjectIdentity()
  const project = await getAccessibleProject(projectId, identity)
  if (!project) return null

  const isOwner = project.ownerId === identity.userId

  const [owner, collaborators] = await Promise.all([
    getOwnerPerson(project),
    getProjectCollaborators(projectId).then((rows) =>
      rows.map((row): SharePerson => ({
        email: row.email,
        displayName: deriveDisplayName(row.email),
        avatarUrl: null,
        role: "collaborator",
      }))
    ),
  ])

  return {
    projectId: project.id,
    projectName: project.name,
    canManage: isOwner,
    owner,
    collaborators,
  }
}

export async function GET(
  _request: NextRequest,
  ctx: RouteContext
) {
  const { projectId } = await ctx.params

  try {
    const share = await buildShare(projectId)
    if (!share) return Response.json({ error: "Not found" }, { status: 404 })
    return Response.json({ share })
  } catch {
    return Response.json({ error: "Failed to load access details" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  ctx: RouteContext
) {
  const { projectId } = await ctx.params
  const identity = await getCurrentProjectIdentity()
  if (!identity.userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const project = await getAccessibleProject(projectId, identity)
  if (!project) return Response.json({ error: "Not found" }, { status: 404 })
  if (project.ownerId !== identity.userId) {
    return Response.json({ error: "Only the project owner can invite collaborators" }, { status: 403 })
  }

  const body: unknown = await request.json().catch(() => ({}))
  const email =
    typeof body === "object" && body !== null && "email" in body && typeof (body as { email: unknown }).email === "string"
      ? (body as { email: string }).email.trim()
      : ""

  if (!email || !isValidCollaboratorEmail(email)) {
    return Response.json({ error: "A valid email is required" }, { status: 400 })
  }

  try {
    const collaborator = await addCollaborator(projectId, email)
    if (!collaborator) {
      return Response.json({ error: "That email is already a collaborator or could not be added" }, { status: 409 })
    }

    const share = await buildShare(projectId)
    return Response.json({ share }, { status: 201 })
  } catch {
    return Response.json({ error: "Failed to invite collaborator" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  ctx: RouteContext
) {
  const { projectId } = await ctx.params
  const identity = await getCurrentProjectIdentity()
  if (!identity.userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const project = await getAccessibleProject(projectId, identity)
  if (!project) return Response.json({ error: "Not found" }, { status: 404 })
  if (project.ownerId !== identity.userId) {
    return Response.json({ error: "Only the project owner can remove collaborators" }, { status: 403 })
  }

  const body: unknown = await request.json().catch(() => ({}))
  const email =
    typeof body === "object" && body !== null && "email" in body && typeof (body as { email: unknown }).email === "string"
      ? (body as { email: string }).email.trim()
      : ""

  if (!email) return Response.json({ error: "email is required" }, { status: 400 })

  try {
    await removeCollaborator(projectId, normalizeCollaboratorEmail(email))
    const share = await buildShare(projectId)
    return Response.json({ share })
  } catch {
    return Response.json({ error: "Failed to remove collaborator" }, { status: 500 })
  }
}
