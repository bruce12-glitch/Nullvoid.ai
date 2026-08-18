import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { isEmailCollaborator } from "@/lib/project-collaborators"

export interface ProjectIdentity {
  userId: string | null
  primaryEmailAddress: string | null
}

export async function getCurrentProjectIdentity(): Promise<ProjectIdentity> {
  // Solo/preview bypass: return the local guest identity when Clerk is not
  // configured (or explicitly bypassed for previews).
  if (
    process.env.PREVIEW_BYPASS_AUTH === "true" ||
    !process.env.CLERK_SECRET_KEY ||
    process.env.CLERK_SECRET_KEY?.includes("dummy") ||
    process.env.CLERK_SECRET_KEY?.includes("preview")
  ) {
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
  } catch {
    // Fallback for preview / invalid clerk keys
    return {
      userId: "preview_user_001",
      primaryEmailAddress: "preview@nullvoid.ai",
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
