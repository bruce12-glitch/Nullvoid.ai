"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { ProjectStatus } from "@/lib/generated/prisma/client";

async function getAuthUserId(): Promise<string | null> {
  // Preview bypass is opt-in AND non-production only, matching proxy.ts and
  // lib/project-access.ts. Gating on the flag alone would let a stray env var
  // collapse every visitor into one shared account in production.
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.PREVIEW_BYPASS_AUTH === "true"
  ) {
    return "preview_user_001";
  }

  try {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    return userId;
  } catch (error) {
    // SECURITY: fail closed. Returning a shared fallback identity here meant
    // any Clerk hiccup handed the caller someone else's project list.
    console.error("[project.actions] auth() failed:", error);
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
