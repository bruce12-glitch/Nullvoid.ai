import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { isEmailCollaborator } from "@/lib/project-collaborators"

export interface ProjectIdentity {
  userId: string | null
  primaryEmailAddress: string | null
}

export async function getCurrentProjectIdentity(): Promise<ProjectIdentity> {
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
