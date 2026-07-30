import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

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

  // We intentionally do not fetch `currentUser()` here to avoid a 300ms+ network delay
  // from Clerk's servers on every page load, as primaryEmailAddress is unused for querying projects.
  return {
    userId,
    primaryEmailAddress: null,
  }
}

export async function getAccessibleProject(
  projectId: string,
  identity: ProjectIdentity
) {
  if (!identity.userId) return null

  return prisma.project.findFirst({
    where: {
      id: projectId,
      userId: identity.userId,
    },
  })
}

export async function userHasProjectAccess(
  projectId: string,
  identity: ProjectIdentity
) {
  const project = await getAccessibleProject(projectId, identity)
  return Boolean(project)
}
