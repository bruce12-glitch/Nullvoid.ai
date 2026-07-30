"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getLatestSpecForProject(projectId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const spec = await prisma.spec.findFirst({
    where: { projectId, status: "COMPLETED" },
    orderBy: { createdAt: "desc" },
  });

  return spec;
}
