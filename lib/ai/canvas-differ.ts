import { z } from "zod";
import { NodeTypeSchema, EdgeTypeSchema, Position3DSchema } from "@/lib/validations/canvas";

// ── Delta Patch Operation Schemas ────────────────────────────────────────────

export const AddNodePatchSchema = z.object({
  op: z.literal("ADD_NODE"),
  node: z.object({
    id: z.string(),
    type: NodeTypeSchema,
    label: z.string(),
    position: Position3DSchema,
    status: z.enum(["active", "warning", "error", "idle"]).default("active"),
    color: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

export const RemoveNodePatchSchema = z.object({
  op: z.literal("REMOVE_NODE"),
  nodeId: z.string(),
});

export const UpdateNodePatchSchema = z.object({
  op: z.literal("UPDATE_NODE"),
  nodeId: z.string(),
  updates: z.object({
    label: z.string().optional(),
    status: z.enum(["active", "warning", "error", "idle"]).optional(),
    color: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

export const ConnectNodesPatchSchema = z.object({
  op: z.literal("CONNECT_NODES"),
  edge: z.object({
    id: z.string(),
    sourceNodeId: z.string(),
    targetNodeId: z.string(),
    type: EdgeTypeSchema,
    label: z.string().optional(),
    animated: z.boolean().optional(),
  }),
});

export const DisconnectNodesPatchSchema = z.object({
  op: z.literal("DISCONNECT_NODES"),
  edgeId: z.string(),
});

// Union of all delta patch operations
export const DeltaPatchSchema = z.discriminatedUnion("op", [
  AddNodePatchSchema,
  RemoveNodePatchSchema,
  UpdateNodePatchSchema,
  ConnectNodesPatchSchema,
  DisconnectNodesPatchSchema,
]);

export const DeltaPatchResponseSchema = z.object({
  rationale: z.string(),
  patches: z.array(DeltaPatchSchema),
  summary: z.string(),
});

export type DeltaPatch = z.infer<typeof DeltaPatchSchema>;
export type DeltaPatchResponse = z.infer<typeof DeltaPatchResponseSchema>;
export type AddNodePatch = z.infer<typeof AddNodePatchSchema>;
export type RemoveNodePatch = z.infer<typeof RemoveNodePatchSchema>;
export type UpdateNodePatch = z.infer<typeof UpdateNodePatchSchema>;
export type ConnectNodesPatch = z.infer<typeof ConnectNodesPatchSchema>;
export type DisconnectNodesPatch = z.infer<typeof DisconnectNodesPatchSchema>;
