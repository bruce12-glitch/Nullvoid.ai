import { task, logger, metadata } from "@trigger.dev/sdk/v3";
import { LiveObject } from "@liveblocks/client";
import { getLiveblocks } from "@/lib/liveblocks";
import { generateArchitectureSpec } from "@/lib/ai/spec-generator";
import { prisma } from "@/lib/prisma";
import { applyLayoutEngine } from "@/lib/ai/layout-engine";
import { applyCollisionAvoidance } from "@/lib/ai/collision-avoidance";
import { put } from "@vercel/blob";

/**
 * Resolves the canvas maps from a Liveblocks room root.
 *
 * The graph lives at `root.flow.{nodes,edges}` — the storage key used by
 * `useLiveblocksFlow()` on the client. Reading `root.nodes` here silently
 * found nothing, so AI-generated architectures were never applied to the
 * canvas even though the run reported success.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getFlowMaps(root: any): { nodes: any; edges: any } | null {
  const flow = root.get("flow");
  if (!flow) return null;
  const nodes = flow.get("nodes");
  const edges = flow.get("edges");
  if (!nodes || !edges) return null;
  return { nodes, edges };
}


const AI_USER_ID = "ghost-ai";
const AI_USER_INFO = { name: "Ghost AI Architect", avatar: "", color: "#6457f9" };

export const generateArchitecture = task({
  id: "generate-architecture",
  retry: { maxAttempts: 0 },
  run: async (payload: { prompt: string; projectId: string; userId: string; canvasId: string }) => {
    const lb = getLiveblocks();

    // 1. Create a spec record in Prisma
    const specRecord = await prisma.projectSpec.create({
      data: {
        projectId: payload.projectId,
        filePath: "generation-in-progress",
      }
    });

    // 2. Broadcast isThinking: true presence
    await lb.setPresence(payload.canvasId, {
      userId: AI_USER_ID,
      data: { cursor: null, thinking: true },
      userInfo: AI_USER_INFO,
      ttl: 120_000,
    }).catch(() => {});

    await lb.broadcastEvent(payload.canvasId, {
      type: "ai-status",
      message: "Queued -> Synthesizing 3D Topology",
      status: "start",
    }).catch(() => {});

    try {
      logger.info(`Starting generation for project ${payload.projectId}`);

      // Fetch current context
      let canvasContext = "The canvas is currently empty.";
      try {
        const doc = await lb.getStorageDocument(payload.canvasId, "json");
        const docData = doc as Record<string, unknown>;
        const nodeCount = docData?.nodes ? Object.keys(docData.nodes as object).length : 0;
        if (nodeCount > 0) {
          canvasContext = `Canvas has ${nodeCount} existing node(s). Current state:\n${JSON.stringify(docData, null, 2)}`;
        }
      } catch {
        // No storage yet
      }

      // 3. Invoke Gemini system architect engine
      const result = await generateArchitectureSpec(payload.prompt, canvasContext);

      // Apply Layout Engine and Collision Avoidance
      result.nodes = (await applyLayoutEngine(
        result.nodes as Parameters<typeof applyLayoutEngine>[0],
        result.edges as Parameters<typeof applyLayoutEngine>[1]
      )) as typeof result.nodes;
      result.nodes = applyCollisionAvoidance(
        result.nodes as Parameters<typeof applyCollisionAvoidance>[0]
      ) as typeof result.nodes;

      await lb.broadcastEvent(payload.canvasId, {
        type: "ai-status",
        message: "Applying CRDT State",
        status: "thinking",
      }).catch(() => {});

      // 4 & 5. Persist nodes/edges to Liveblocks Room Storage
      await lb.mutateStorage(payload.canvasId, ({ root }) => {
        const maps = getFlowMaps(root);
        if (!maps) return;
        const { nodes, edges } = maps;

        result.nodes.forEach((n) => {
          nodes.set(n.id, LiveObject.from(n));
        });

        result.edges.forEach((e) => {
          edges.set(e.id, LiveObject.from(e));
        });
      });

      // 4. Update Prisma spec record
      const specContent = JSON.stringify({
        overview: result.overview,
        specification: result.specification
      });
      
      const blob = await put(`specs/${payload.projectId}/${Date.now()}-architecture.json`, specContent, {
        access: "private",
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      
      await prisma.projectSpec.update({
        where: { id: specRecord.id },
        data: {
          filePath: blob.url,
        }
      });

      await prisma.project.update({
        where: { id: payload.projectId },
        data: { updatedAt: new Date() }
      });

      await lb.broadcastEvent(payload.canvasId, {
        type: "ai-status",
        message: "Complete",
        status: "complete",
      }).catch(() => {});

      return { success: true, specId: specRecord.id };
    } catch (error: unknown) {
      // 6. Catch errors gracefully
      logger.error("Failed to generate architecture:", { error: error instanceof Error ? error.message : String(error) });

      // Best-effort status write — never let error-handling itself throw,
      // otherwise it would mask the original error.
      try {
        await prisma.projectSpec.update({
          where: { id: specRecord.id },
          data: { filePath: "Failed to generate spec." }
        });
      } catch {
        // ignore — the original error is the one that matters
      }

      await lb.broadcastEvent(payload.canvasId, {
        type: "ai-status",
        message: "Generation failed.",
        status: "error",
      }).catch(() => {});

      throw error;
    } finally {
      await lb.setPresence(payload.canvasId, {
        userId: AI_USER_ID,
        data: { cursor: null, thinking: false },
        userInfo: AI_USER_INFO,
        ttl: 3_000,
      }).catch(() => {});
    }
  },
});
