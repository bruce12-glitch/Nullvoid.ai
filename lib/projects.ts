import { prisma } from "@/lib/prisma"
import { Project } from "@prisma/client"

export async function getProjectsForUser(userId: string) {
  const owned = await prisma.project.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return {
    owned,
    shared: [] as Project[],
  }
}
