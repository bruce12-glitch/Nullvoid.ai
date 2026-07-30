"use server";

import { revalidatePath } from "next/cache";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { Prisma } from "@/app/generated/prisma/client";

async function ensureUserExists(userId: string) {
  const existing = await db.user.findUnique({ where: { id: userId }, select: { id: true } })
  if (existing) return

  const user = await currentUser()
  await db.user.upsert({
    where: { id: userId },
    create: {
      id: userId,
      email: user?.emailAddresses?.[0]?.emailAddress ?? `${userId}@clerk.dev`,
      name: user?.fullName ?? user?.firstName ?? "User",
      imageUrl: user?.imageUrl ?? null,
    },
    update: {
      name: user?.fullName ?? user?.firstName ?? undefined,
      imageUrl: user?.imageUrl ?? undefined,
    },
  })
}

export async function createProject(data: { title: string; description?: string; template?: string }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Ensure user record exists before FK reference
  await ensureUserExists(userId);

  const project = await db.project.create({
    data: {
      title: data.title,
      description: data.description,
      userId,
      canvasData: data.template === "microservices" ? { type: "microservices" } : 
                  data.template === "agent" ? { type: "agent" } : {},
    },
  });

  revalidatePath("/dashboard");
  return project;
}

export async function getProjects() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const projects = await db.project.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  return projects;
}

export async function getProjectById(projectId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const project = await db.project.findUnique({
    where: { id: projectId },
  });

  if (!project || project.userId !== userId) {
    throw new Error("Project not found or unauthorized");
  }

  return project;
}

export async function updateProject(projectId: string, data: Partial<{ title: string; description: string; isStarred: boolean; isArchived: boolean; canvasData: Prisma.InputJsonValue }>) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Verify ownership
  const existing = await db.project.findUnique({ where: { id: projectId } });
  if (!existing || existing.userId !== userId) throw new Error("Unauthorized");

  const updated = await db.project.update({
    where: { id: projectId },
    data,
  });

  revalidatePath("/dashboard");
  return updated;
}

export async function deleteProject(projectId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Verify ownership
  const existing = await db.project.findUnique({ where: { id: projectId } });
  if (!existing || existing.userId !== userId) throw new Error("Unauthorized");

  await db.project.delete({
    where: { id: projectId },
  });

  revalidatePath("/dashboard");
  return { success: true };
}
