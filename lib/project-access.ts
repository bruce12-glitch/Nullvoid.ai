import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { isEmailCollaborator } from "@/lib/project-collaborators"

export interface ProjectIdentity {
  userId: string | null
  primaryEmailAddress: string | null
}

/**
 * True only for a local, non-production preview that has explicitly opted in.
 *
 * SECURITY: this is deliberately strict. It is NOT enough to set the flag —
 * the build must also not be a production build. Previously this also matched
 * on `CLERK_SECRET_KEY.includes("dummy"|"preview")`, which meant a stray or
 * placeholder key silently collapsed every visitor into one shared account.
 */
export function isPreviewAuthBypass(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.PREVIEW_BYPASS_AUTH === "true"
  )
}

export async function getCurrentProjectIdentity(): Promise<ProjectIdentity> {
  if (isPreviewAuthBypass()) {
    return {
      userId: "preview_user_001",
      primaryEmailAddress: "preview@nullvoid.ai",
    }
  }

  try {
    const { userId } = await auth()

    if (!userId) {
      return {
        userId: null,
        primaryEmailAddress: null,
      }
    }

    const user = await currentUser()

    return {
      userId,
      primaryEmailAddress: user?.primaryEmailAddress?.emailAddress ?? null,
    }
  } catch (error) {
    // SECURITY: fail CLOSED. This used to return a shared "preview_user_001"
    // identity, so any Clerk outage or misconfiguration in production would
    // hand every anonymous visitor the same authenticated account — and with
    // it, read/write access to that account's projects.
    console.error("[project-access] Clerk identity resolution failed:", error)
    return {
      userId: null,
      primaryEmailAddress: null,
    }
  }
}

export async function getAccessibleProject(
  projectId: string,
  identity: ProjectIdentity
) {
  if (!identity.userId) return null

  const project = await prisma.project.findFirst({
    where: { id: projectId },
    select: { id: true, ownerId: true, name: true, description: true, status: true, canvasBlobUrl: true, createdAt: true, updatedAt: true },
  })

  if (!project) return null
  if (project.ownerId === identity.userId) return project

  if (identity.primaryEmailAddress) {
    const isCollab = await isEmailCollaborator(projectId, identity.primaryEmailAddress)
    if (isCollab) return project
  }

  return null
}

export async function userHasProjectAccess(
  projectId: string,
  identity: ProjectIdentity
) {
  const project = await getAccessibleProject(projectId, identity)
  return Boolean(project)
}
