import { prisma } from "@/lib/prisma"

export async function getProjectsForUser(userId: string, email?: string | null) {
  let owned: Awaited<ReturnType<typeof prisma.project.findMany>> = []
  let shared: typeof owned = []

  try {
    owned = await prisma.project.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
      take: 100,
    })
  } catch {
    return { owned, shared }
  }

  if (email) {
    try {
      // Collaborators are stored normalized (lowercased/trimmed) by
      // addCollaborator — normalize here so case differences don't miss them.
      const normalizedEmail = email.trim().toLowerCase()
      const collabEntries = await prisma.projectCollaborator.findMany({
        where: { email: normalizedEmail },
        select: { projectId: true },
      })
      if (collabEntries.length > 0) {
        shared = await prisma.project.findMany({
          where: { id: { in: collabEntries.map(c => c.projectId) }, ownerId: { not: userId } },
          orderBy: { createdAt: "desc" },
          take: 100,
        })
      }
    } catch {
      shared = []
    }
  }

  return { owned, shared }
}
