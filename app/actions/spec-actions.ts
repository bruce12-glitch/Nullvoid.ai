"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentProjectIdentity, userHasProjectAccess } from "@/lib/project-access";

export async function getLatestSpecForProject(projectId: string) {
  const identity = await getCurrentProjectIdentity();
  if (!identity.userId) throw new Error("Unauthorized");

  // Owners and collaborators both get spec access — consistent with
  // userHasProjectAccess used everywhere else.
  const hasAccess = await userHasProjectAccess(projectId, identity);
  if (!hasAccess) throw new Error("Unauthorized");

  const spec = await prisma.projectSpec.findFirst({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });

  return spec;
}
