import { prisma } from "@/lib/prisma"

export async function getProjectCollaborators(projectId: string) {
  try {
    return await prisma.projectCollaborator.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    })
  } catch {
    return []
  }
}

export async function addCollaborator(
  projectId: string,
  email: string,
) {
  const normalized = normalizeCollaboratorEmail(email)
  if (!isValidCollaboratorEmail(normalized)) return null

  try {
    return await prisma.projectCollaborator.create({
      data: {
        projectId,
        email: normalized,
      },
    })
  } catch {
    return null
  }
}

export async function removeCollaborator(projectId: string, email: string) {
  try {
    await prisma.projectCollaborator.deleteMany({
      where: { projectId, email: normalizeCollaboratorEmail(email) },
    })
    return { success: true }
  } catch {
    return null
  }
}

export async function isEmailCollaborator(projectId: string, email: string): Promise<boolean> {
  try {
    const count = await prisma.projectCollaborator.count({
      where: { projectId, email: normalizeCollaboratorEmail(email) },
    })
    return count > 0
  } catch {
    return false
  }
}

export function isValidCollaboratorEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function normalizeCollaboratorEmail(email: string) {
  return email.trim().toLowerCase()
}

export async function getProjectShareDetails(
  projectId: string,
  identity: { userId: string | null; primaryEmailAddress: string | null }
) {
  if (!identity.userId) return null

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true },
    })
    if (!project) return null
    if (project.ownerId === identity.userId) return { role: "OWNER" }

    if (identity.primaryEmailAddress) {
      const isCollab = await isEmailCollaborator(projectId, identity.primaryEmailAddress)
      if (isCollab) return { role: "EDITOR" }
    }

    return null
  } catch {
    return null
  }
}
