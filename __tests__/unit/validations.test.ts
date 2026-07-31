import { expect, test, describe } from "vitest";
import { CanvasNodeSchema, CanvasEdgeSchema, SystemSpecSchema } from "@/lib/validations/canvas";

describe("Validations", () => {
  test("CanvasNodeSchema validates correct node", () => {
    const validNode = {
      id: "node-1",
      type: "SERVICE",
      label: "Test Node",
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      color: "#1F1F1F",
      metadata: {},
      status: "active",
    };
    expect(CanvasNodeSchema.safeParse(validNode).success).toBe(true);
  });

  test("CanvasNodeSchema rejects invalid position", () => {
    const invalidNode = {
      id: "node-2",
      type: "SERVICE",
      position: { x: 0, y: "invalid", z: 0 },
      data: { label: "Test Node" }
    };
    expect(CanvasNodeSchema.safeParse(invalidNode).success).toBe(false);
  });

  test("CanvasEdgeSchema validates correct edge", () => {
    const validEdge = {
      id: "edge-1",
      sourceNodeId: "node-1",
      targetNodeId: "node-2",
      type: "SYNC_HTTP",
    };
    expect(CanvasEdgeSchema.safeParse(validEdge).success).toBe(true);
  });
});
