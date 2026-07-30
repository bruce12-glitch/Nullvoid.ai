import { expect, test, describe } from "vitest";
import { CanvasNodeSchema, CanvasEdgeSchema, SystemSpecSchema } from "@/lib/validations/canvas";

describe("Validations", () => {
  test("CanvasNodeSchema validates correct node", () => {
    const validNode = {
      id: "node-1",
      type: "SERVICE",
      position: { x: 0, y: 0, z: 0 },
      data: { label: "Test Node" },
      color: "#1F1F1F"
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
      source: "node-1",
      target: "node-2",
      type: "smoothstep"
    };
    expect(CanvasEdgeSchema.safeParse(validEdge).success).toBe(true);
  });
});
