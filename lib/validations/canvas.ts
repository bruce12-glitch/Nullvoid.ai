import { z } from "zod";

export const Position3DSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number().optional(),
});

export const Rotation3DSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number().optional(),
});

export const NodeTypeSchema = z.enum([
  "SERVICE",
  "DATABASE",
  "API_GATEWAY",
  "AUTH_PROVIDER",
  "MESSAGE_QUEUE",
  "STORAGE_BUCKET",
  "ROBOT_UNIT",
  "CUSTOM_3D",
]);

export const EdgeTypeSchema = z.enum([
  "SYNC_HTTP",
  "ASYNC_EVENT",
  "GRPC",
  "WEBSOCKET",
  "DATABASE_CONNECTION",
]);

export const CanvasNodeSchema = z.object({
  id: z.string(),
  type: NodeTypeSchema,
  label: z.string(),
  position: Position3DSchema,
  rotation: Rotation3DSchema,
  scale: Position3DSchema,
  color: z.string().optional(),
  modelPath: z.string().optional(),
  metadata: z.record(z.any()),
  status: z.enum(["active", "warning", "error", "idle"]),
});

export const CanvasEdgeSchema = z.object({
  id: z.string(),
  sourceNodeId: z.string(),
  targetNodeId: z.string(),
  type: EdgeTypeSchema,
  label: z.string().optional(),
  animated: z.boolean().optional(),
});

export const CanvasExportSchema = z.object({
  nodes: z.array(CanvasNodeSchema),
  edges: z.array(CanvasEdgeSchema),
  version: z.string(),
}).passthrough();

export const SystemSpecSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string(),
  version: z.string(),
  overview: z.string(),
  services: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      description: z.string(),
      techStack: z.array(z.string()),
    })
  ),
  security: z.object({
    authMethod: z.string(),
    encryption: z.string(),
    compliance: z.array(z.string()),
  }),
  infrastructure: z.object({
    cloudProvider: z.string(),
    region: z.string(),
    estimateCost: z.string(),
  }),
});
