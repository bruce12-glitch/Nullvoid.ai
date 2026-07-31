import { task } from "@trigger.dev/sdk/v3";
import { LiveObject } from "@liveblocks/client";
import type { LiveblocksNode, LiveblocksEdge } from "@liveblocks/react-flow";
import { getLiveblocks } from "@/lib/liveblocks";
import { generateArchitectureSpec } from "@/lib/ai/spec-generator";
import type { CanvasNode, CanvasEdge } from "@/types/canvas";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";

const AI_USER_ID = "ghost-ai";
const AI_USER_INFO = { name: "Ghost AI 3D", avatar: "", color: "#6457f9" };

export const designAgent3D = task({
  id: "design-agent-3d",
  retry: { maxAttempts: 0 },
  run: async (payload: { prompt: string; roomId: string; projectId: string; userId: string }) => {
    const lb = getLiveblocks();

    await lb.setPresence(payload.roomId, {
      userId: AI_USER_ID,
      data: { cursor: null, thinking: true },
      userInfo: AI_USER_INFO,
      ttl: 120_000,
    }).catch(() => {});

    await lb.broadcastEvent(payload.roomId, {
      type: "ai-status",
      message: "Ghost AI 3D is architecting your request...",
      status: "start",
    }).catch(() => {});

    try {
      // 1. Fetch current context
      let canvasContext = "The canvas is currently empty.";
      try {
        const doc = await lb.getStorageDocument(payload.roomId, "json");
        const docData = doc as Record<string, unknown>;
        const nodeCount = docData?.nodes ? Object.keys(docData.nodes as object).length : 0;
        if (nodeCount > 0) {
          canvasContext = `Canvas has ${nodeCount} existing node(s). Current state:\n${JSON.stringify(docData, null, 2)}`;
        }
      } catch {
        // No storage yet
      }

      // 2. Generate 3D Architecture using the Gemini Engine
      const result = await generateArchitectureSpec(payload.prompt, canvasContext);

      await lb.broadcastEvent(payload.roomId, {
        type: "ai-status",
        message: `Applying ${result.nodes.length} 3D nodes and ${result.edges.length} connections...`,
        status: "thinking",
      }).catch(() => {});

      // 3. Mutate Liveblocks CRDT
      await lb.mutateStorage(payload.roomId, ({ root }) => {
        const nodes = root.get("nodes") as any;
        const edges = root.get("edges") as any;
        if (!nodes || !edges) return;

        // Apply nodes
        result.nodes.forEach((n) => {
          nodes.set(
            n.id,
            LiveObject.from(n)
          );
        });

        // Apply edges
        result.edges.forEach((e) => {
          edges.set(
            e.id,
            LiveObject.from(e)
          );
        });
      });

      // 4. Save the generated Specification document to DB
      const specContent = `# ${result.overview ?? "Architecture Overview"}\n\n## Services\n${(result.specification?.services ?? []).map(s => `- **${s.name}** (${s.type}): ${s.description} [Stack: ${(s.techStack ?? []).join(", ")}]`).join("\n")}\n\n## Infrastructure & Security\n- **Cloud**: ${result.specification?.infrastructure?.cloudProvider ?? "N/A"} (${result.specification?.infrastructure?.region ?? "N/A"})\n- **Cost**: ${result.specification?.infrastructure?.estimateCost ?? "N/A"}\n- **Auth**: ${result.specification?.security?.authMethod ?? "N/A"}\n- **Encryption**: ${result.specification?.security?.encryption ?? "N/A"}\n- **Compliance**: ${(result.specification?.security?.compliance ?? []).join(", ")}`;

      const blob = await put(`specs/${payload.projectId}/${Date.now()}-design-agent.md`, specContent, {
        access: "private",
        contentType: "text/markdown",
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      
      const record = await prisma.projectSpec.create({
        data: {
          filePath: blob.url,
          projectId: payload.projectId,
        },
      });

      await lb.broadcastEvent(payload.roomId, {
        type: "ai-status",
        message: "3D Architecture applied successfully.",
        status: "complete",
      }).catch(() => {});

      return { success: true, specId: record.id };
    } catch (error) {
      await lb.broadcastEvent(payload.roomId, {
        type: "ai-status",
        message: "Ghost AI encountered an error while building the 3D architecture.",
        status: "error",
      }).catch(() => {});
      throw error;
    } finally {
      await lb.setPresence(payload.roomId, {
        userId: AI_USER_ID,
        data: { cursor: null, thinking: false },
        userInfo: AI_USER_INFO,
        ttl: 3_000,
      }).catch(() => {});
    }
  },
});
