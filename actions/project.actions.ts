"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { ProjectStatus } from "@/lib/generated/prisma/client";

async function getAuthUserId(): Promise<string | null> {
  // Solo mode: no Clerk secret (or explicit bypass) → local guest identity.
  if (
    process.env.PREVIEW_BYPASS_AUTH === "true" ||
    !process.env.CLERK_SECRET_KEY ||
    process.env.CLERK_SECRET_KEY.includes("dummy") ||
    process.env.CLERK_SECRET_KEY.includes("preview")
  ) {
    return "preview_user_001"
  }
  try {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    return userId;
  } catch {
    if (process.env.NODE_ENV !== "production") return "preview_user_001"
    return null;
  }
}

export async function createProject(data: { title: string; description?: string; template?: string }) {
  const userId = await getAuthUserId();
  if (!userId) throw new Error("Unauthorized");

  const project = await db.project.create({
    data: {
      name: data.title,
      description: data.description,
      ownerId: userId,
      canvasBlobUrl: data.template ? `template-${data.template}` : null,
    },
  });

  revalidatePath("/dashboard");
  return project;
}

export async function getProjects() {
  const userId = await getAuthUserId();
  if (!userId) throw new Error("Unauthorized");

  const projects = await db.project.findMany({
    where: { ownerId: userId },
    orderBy: { updatedAt: "desc" },
  });

  return projects;
}

export async function getProjectById(projectId: string) {
  const userId = await getAuthUserId();
  if (!userId) throw new Error("Unauthorized");

  const project = await db.project.findUnique({
    where: { id: projectId },
  });

  if (!project || project.ownerId !== userId) {
    throw new Error("Project not found or unauthorized");
  }

  return project;
}

export async function updateProject(projectId: string, data: Partial<{ name: string; description: string; status: ProjectStatus; canvasBlobUrl: string }>) {
  const userId = await getAuthUserId();
  if (!userId) throw new Error("Unauthorized");

  // Verify ownership
  const existing = await db.project.findUnique({ where: { id: projectId } });
  if (!existing || existing.ownerId !== userId) throw new Error("Unauthorized");

  const updated = await db.project.update({
    where: { id: projectId },
    data,
  });

  revalidatePath("/dashboard");
  return updated;
}

export async function deleteProject(projectId: string) {
  const userId = await getAuthUserId();
  if (!userId) throw new Error("Unauthorized");

  // Verify ownership
  const existing = await db.project.findUnique({ where: { id: projectId } });
  if (!existing || existing.ownerId !== userId) throw new Error("Unauthorized");

  await db.project.delete({
    where: { id: projectId },
  });

  revalidatePath("/dashboard");
  return { success: true };
}
