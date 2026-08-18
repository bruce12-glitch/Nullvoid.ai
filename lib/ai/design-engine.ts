/**
 * Design engine — shared core of the Ghost AI design agent.
 *
 * Runs the Gemini tool-calling loop that architects a React Flow canvas.
 * Used in two execution contexts:
 *  - trigger/design-agent.ts     (background job, FULL mode)
 *  - app/api/ai/design/route.ts  (inline fallback, SOLO mode / no Trigger.dev)
 */

import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { withGeminiModelFallback } from "@/lib/ai/model-fallback"
import { generateText, tool, stepCountIs } from "ai"
import { z } from "zod"
import { NODE_COLORS, SHAPE_DEFAULTS, NODE_SHAPES } from "@/types/canvas"
import type { CanvasNode, CanvasEdge, NodeShape } from "@/types/canvas"

const COLOR_NAMES = ["neutral", "blue", "purple", "orange", "red", "pink", "green", "teal"]

export function buildDesignSystemPrompt(): string {
  const colorGuide = NODE_COLORS.map(
    (c, i) => `  ${i} (${COLOR_NAMES[i]}): fill=${c.fill} text=${c.text}`
  ).join("\n")

  return `You are Ghost AI, an expert system architect that generates technical architecture diagrams on a collaborative canvas.

ALLOWED SHAPES (use exact value):
- rectangle  → services, APIs, microservices, components
- cylinder   → databases, storage, caches
- hexagon    → external systems, third-party services, boundaries
- circle     → events, triggers, endpoints, user entry-points
- diamond    → decision gateways, conditionals
- pill       → processes, workflows, jobs

COLOR PALETTE (colorIndex 0-7):
${colorGuide}
Recommended mapping:
- 1 (blue)   → APIs, services, servers
- 7 (teal)   → databases, storage
- 3 (orange) → message queues, brokers, async flows
- 6 (green)  → success paths, healthy services, CDN
- 2 (purple) → auth, security, identity
- 5 (pink)   → user-facing UI, clients
- 0 (neutral)→ generic / unclassified

LAYOUT RULES:
- Start top-left at approximately x=100, y=80
- Horizontal gap between sibling nodes: 240-280px
- Vertical gap between rows: 160-200px
- Group related nodes in horizontal rows; use vertical rows for sequential flows
- Edge IDs must be unique, e.g. "edge-api-auth", "edge-1"
- Node IDs must be unique short slugs, e.g. "api-gateway", "user-db", "auth-service"

GENERATION RULES:
- Create 5-12 nodes; do not overcrowd
- Add edges to show data/request flow
- Prefer clear left→right or top→bottom flows
- When the canvas already has nodes, extend or modify instead of replacing unless asked

INSTRUCTIONS:
- Call addNode for each node you want to place on the canvas
- Call addEdge for each connection between nodes
- Call finalizeDesign last with a 1-2 sentence summary of what was designed`
}

function clampColor(idx: number): number {
  return Math.min(Math.max(Math.round(idx ?? 0), 0), NODE_COLORS.length - 1)
}

export const designTools = {
  addNode: tool({
    description: "Add a new node to the canvas",
    inputSchema: z.object({
      id: z.string().describe('Unique slug ID e.g. "api-gateway", "user-db"'),
      label: z.string().describe("Display label for the node"),
      shape: z.enum(NODE_SHAPES).describe("Node shape"),
      colorIndex: z.number().int().min(0).max(7).describe("Color palette index 0-7"),
      x: z.number().describe("X position in pixels"),
      y: z.number().describe("Y position in pixels"),
    }),
    execute: async () => "ok",
  }),
  moveNode: tool({
    description: "Move an existing node to a new position",
    inputSchema: z.object({ id: z.string(), x: z.number(), y: z.number() }),
    execute: async () => "ok",
  }),
  resizeNode: tool({
    description: "Resize an existing node",
    inputSchema: z.object({ id: z.string(), width: z.number().positive(), height: z.number().positive() }),
    execute: async () => "ok",
  }),
  updateNodeData: tool({
    description: "Update the label, shape, or color of an existing node",
    inputSchema: z.object({
      id: z.string(),
      label: z.string().optional(),
      shape: z.enum(NODE_SHAPES).optional(),
      colorIndex: z.number().int().min(0).max(7).optional(),
    }),
    execute: async () => "ok",
  }),
  deleteNode: tool({
    description: "Delete a node from the canvas",
    inputSchema: z.object({ id: z.string() }),
    execute: async () => "ok",
  }),
  addEdge: tool({
    description: "Add a directed edge between two nodes",
    inputSchema: z.object({
      id: z.string().describe('Unique edge ID e.g. "edge-api-db"'),
      source: z.string().describe("Source node ID"),
      target: z.string().describe("Target node ID"),
      label: z.string().optional().describe("Optional edge label"),
    }),
    execute: async () => "ok",
  }),
  deleteEdge: tool({
    description: "Delete an edge from the canvas",
    inputSchema: z.object({ id: z.string() }),
    execute: async () => "ok",
  }),
  finalizeDesign: tool({
    description: "Complete the design and provide a summary — call this last",
    inputSchema: z.object({
      summary: z.string().describe("1-2 sentence description of the designed architecture"),
    }),
    execute: async () => "done",
  }),
}

export type DesignToolName = keyof typeof designTools
export type DesignToolCall = { toolName: DesignToolName; input: Record<string, unknown> }

export interface DesignRunResult {
  actionCalls: DesignToolCall[]
  summary: string
}

/** Run the Gemini design agent and return raw tool calls + summary. */
export async function runDesignAgent(prompt: string, canvasContext: string): Promise<DesignRunResult> {
  const apiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY
  if (!apiKey) throw new Error("Missing Gemini API key (GOOGLE_GENERATIVE_AI_API_KEY)")

  const google = createGoogleGenerativeAI({ apiKey })

  const result = await withGeminiModelFallback((modelId) =>
    generateText({
      model: google(modelId),
      system: buildDesignSystemPrompt(),
      prompt: `User request: ${prompt}\n\n${canvasContext}`,
      tools: designTools,
      toolChoice: "required",
      stopWhen: stepCountIs(8),
      maxRetries: 1,
    })
  )

  const toolCalls = result.steps.flatMap((s) => s.toolCalls) as DesignToolCall[]
  const actionCalls = toolCalls.filter((c) => c.toolName !== "finalizeDesign")
  const finalizeCall = toolCalls.find((c) => c.toolName === "finalizeDesign")
  const summary =
    (finalizeCall?.input as { summary?: string } | undefined)?.summary ?? "Design applied to canvas."

  return { actionCalls, summary }
}

/** Build a textual context of the current canvas for the model. */
export function buildCanvasContext(nodes: CanvasNode[], edges: CanvasEdge[]): string {
  if (!nodes.length) return "The canvas is currently empty — create a fresh design."
  const state = {
    nodes: Object.fromEntries(nodes.map((n) => [n.id, n])),
    edges: Object.fromEntries(edges.map((e) => [e.id, e])),
  }
  return `Canvas has ${nodes.length} existing node(s). Current state:\n${JSON.stringify(state, null, 2)}\nExtend or modify based on the request; only clear if explicitly asked.`
}

/**
 * Apply tool calls to plain React Flow arrays (SOLO mode — no CRDT).
 * Returns brand new arrays; inputs are not mutated.
 */
export function applyDesignActions(
  actionCalls: DesignToolCall[],
  currentNodes: CanvasNode[],
  currentEdges: CanvasEdge[]
): { nodes: CanvasNode[]; edges: CanvasEdge[] } {
  const nodes = new Map<string, CanvasNode>(currentNodes.map((n) => [n.id, structuredClone(n)]))
  const edges = new Map<string, CanvasEdge>(currentEdges.map((e) => [e.id, structuredClone(e)]))

  for (const call of actionCalls) {
    const input = call.input
    switch (call.toolName) {
      case "addNode": {
        const { id, label, shape, colorIndex, x, y } = input as {
          id: string; label: string; shape: NodeShape; colorIndex: number; x: number; y: number
        }
        const color = NODE_COLORS[clampColor(colorIndex)]
        const size = SHAPE_DEFAULTS[shape] ?? SHAPE_DEFAULTS.rectangle
        nodes.set(id, {
          id,
          type: "canvasNode",
          position: { x, y },
          data: { label, color: color.fill, textColor: color.text, shape },
          width: size.width,
          height: size.height,
        } as CanvasNode)
        break
      }
      case "moveNode": {
        const { id, x, y } = input as { id: string; x: number; y: number }
        const n = nodes.get(id)
        if (n) n.position = { x, y }
        break
      }
      case "resizeNode": {
        const { id, width, height } = input as { id: string; width: number; height: number }
        const n = nodes.get(id)
        if (n) { n.width = width; n.height = height }
        break
      }
      case "updateNodeData": {
        const { id, label, shape, colorIndex } = input as {
          id: string; label?: string; shape?: NodeShape; colorIndex?: number
        }
        const n = nodes.get(id)
        if (!n) break
        const data = { ...(n.data as Record<string, unknown>) }
        if (label !== undefined) data.label = label
        if (shape !== undefined) data.shape = shape
        if (colorIndex !== undefined) {
          const color = NODE_COLORS[clampColor(colorIndex)]
          data.color = color.fill
          data.textColor = color.text
        }
        n.data = data as CanvasNode["data"]
        break
      }
      case "deleteNode": {
        const { id } = input as { id: string }
        nodes.delete(id)
        for (const [eid, e] of [...edges]) {
          if (e.source === id || e.target === id) edges.delete(eid)
        }
        break
      }
      case "addEdge": {
        const { id, source, target, label } = input as {
          id: string; source: string; target: string; label?: string
        }
        edges.set(id, {
          id,
          source,
          target,
          type: "canvasEdge",
          data: { label: label ?? "" },
          markerEnd: {
            type: "arrowclosed",
            color: "rgba(255,255,255,0.4)",
            width: 16,
            height: 16,
          },
        } as unknown as CanvasEdge)
        break
      }
      case "deleteEdge": {
        const { id } = input as { id: string }
        edges.delete(id)
        break
      }
      default:
        break
    }
  }

  return { nodes: [...nodes.values()], edges: [...edges.values()] }
}

/* ------------------------------------------------------------------ */
/* CRDT application (FULL-collab mode without Trigger.dev)             */
/* ------------------------------------------------------------------ */

const NODE_SYNC_CONFIG = {
  selected: false,
  dragging: false,
  measured: false,
  resizing: false,
  position: "atomic" as const,
  sourcePosition: "atomic" as const,
  targetPosition: "atomic" as const,
  extent: "atomic" as const,
  origin: "atomic" as const,
  handles: "atomic" as const,
}

const EDGE_SYNC_CONFIG = {
  selected: false,
  markerStart: "atomic" as const,
  markerEnd: "atomic" as const,
  label: "atomic" as const,
  labelBgPadding: "atomic" as const,
}

/**
 * Apply tool calls to a Liveblocks room's CRDT storage server-side.
 * Returns false when the room storage isn't initialised yet.
 */
export async function applyDesignActionsToRoom(
  roomId: string,
  actionCalls: DesignToolCall[]
): Promise<boolean> {
  const [{ LiveObject }, { getLiveblocks }] = await Promise.all([
    import("@liveblocks/client"),
    import("@/lib/liveblocks"),
  ])
  const lb = getLiveblocks()
  let applied = false

  await lb.mutateStorage(roomId, ({ root }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nodes = root.get("nodes") as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const edges = root.get("edges") as any
    if (!nodes || !edges) return
    applied = true

    for (const call of actionCalls) {
      const input = call.input
      switch (call.toolName) {
        case "addNode": {
          const { id, label, shape, colorIndex, x, y } = input as {
            id: string; label: string; shape: NodeShape; colorIndex: number; x: number; y: number
          }
          const color = NODE_COLORS[clampColor(colorIndex)]
          const size = SHAPE_DEFAULTS[shape] ?? SHAPE_DEFAULTS.rectangle
          nodes.set(
            id,
            LiveObject.from(
              {
                id,
                type: "canvasNode",
                label,
                position: { x, y },
                data: { label, color: color.fill, textColor: color.text, shape },
                width: size.width,
                height: size.height,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } as any,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              NODE_SYNC_CONFIG as any
            )
          )
          break
        }
        case "moveNode": {
          const { id, x, y } = input as { id: string; x: number; y: number }
          const n = nodes.get(id)
          if (n) n.set("position", { x, y })
          break
        }
        case "resizeNode": {
          const { id, width, height } = input as { id: string; width: number; height: number }
          const n = nodes.get(id)
          if (n) { n.set("width", width); n.set("height", height) }
          break
        }
        case "updateNodeData": {
          const { id, label, shape, colorIndex } = input as {
            id: string; label?: string; shape?: NodeShape; colorIndex?: number
          }
          const n = nodes.get(id)
          if (!n) break
          const data = n.get("data")
          if (!data) break
          if (label !== undefined) data.set("label", label)
          if (shape !== undefined) data.set("shape", shape)
          if (colorIndex !== undefined) {
            const color = NODE_COLORS[clampColor(colorIndex)]
            data.set("color", color.fill)
            data.set("textColor", color.text)
          }
          break
        }
        case "deleteNode": {
          const { id } = input as { id: string }
          nodes.delete(id)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const toDelete: string[] = []
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          edges.forEach((e: any, eid: string) => {
            const plain = typeof e?.toObject === "function" ? e.toObject() : e
            if (plain?.source === id || plain?.target === id) toDelete.push(eid)
          })
          toDelete.forEach((eid) => edges.delete(eid))
          break
        }
        case "addEdge": {
          const { id, source, target, label } = input as {
            id: string; source: string; target: string; label?: string
          }
          edges.set(
            id,
            LiveObject.from(
              {
                id,
                source,
                target,
                type: "canvasEdge",
                data: { label: label ?? "" },
                markerEnd: { type: "arrowclosed", color: "rgba(255,255,255,0.4)", width: 16, height: 16 },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } as any,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              EDGE_SYNC_CONFIG as any
            )
          )
          break
        }
        case "deleteEdge": {
          const { id } = input as { id: string }
          edges.delete(id)
          break
        }
        default:
          break
      }
    }
  })

  return applied
}
