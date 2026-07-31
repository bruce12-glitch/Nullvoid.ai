import { CanvasExportSchema } from "@/lib/validations/canvas";
import type { CanvasNode, CanvasEdge } from "@/types/canvas";
import { z } from "zod";

/**
 * Strips internal runtime data (like selection state, if any got injected)
 * and returns a clean copy of the node array.
 */
function sanitizeNodes(nodes: CanvasNode[]): CanvasNode[] {
  return nodes.map((node) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { selected, dragging, ...cleanNode } = node;
    
    return {
      ...cleanNode,
      // Ensure we don't accidentally export undefined/NaN runtime artifacts
      position: {
        x: Number(node.position.x.toFixed(2)),
        y: Number(node.position.y.toFixed(2)),
        z: node.position.z ? Number(node.position.z.toFixed(2)) : 0,
      },
      rotation: node.rotation ? {
        x: Number(node.rotation.x.toFixed(4)),
        y: Number(node.rotation.y.toFixed(4)),
        z: node.rotation.z ? Number(node.rotation.z.toFixed(4)) : 0,
      } : { x: 0, y: 0, z: 0 },
      scale: node.scale ? {
        x: Number(node.scale.x.toFixed(2)),
        y: Number(node.scale.y.toFixed(2)),
        z: node.scale.z ? Number(node.scale.z.toFixed(2)) : 1,
      } : { x: 1, y: 1, z: 1 },
      status: node.status || "idle",
      metadata: node.metadata || {},
    };
  });
}

/**
 * Strips internal runtime data and returns clean edges.
 */
function sanitizeEdges(edges: CanvasEdge[]): CanvasEdge[] {
  return edges.map((edge) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { selected, ...cleanEdge } = edge;
    return {
      ...cleanEdge,
    };
  });
}

/**
 * Serializes the current canvas graph into a structured JSON string.
 */
export function exportCanvasToJSON(
  nodes: CanvasNode[],
  edges: CanvasEdge[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: Record<string, any> = {}
): string {
  const payload = {
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    nodes: sanitizeNodes(nodes),
    edges: sanitizeEdges(edges),
    metadata,
  };

  // Validate the outbound payload just to be safe
  const validatedPayload = CanvasExportSchema.parse(payload);
  
  return JSON.stringify(validatedPayload, null, 2);
}

/**
 * Downloads a JSON string as a file to the user's local disk.
 */
export function downloadJSONFile(jsonString: string, filename?: string) {
  if (typeof document === "undefined" || typeof Blob === "undefined") return;
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || `nullvoid-spec-${Date.now()}.json`;
  
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Deserializes and validates a JSON string back into canvas state.
 */
export function importCanvasFromJSON(jsonString: string) {
  try {
    const rawData = JSON.parse(jsonString);
    const parsedData = CanvasExportSchema.parse(rawData);
    
    return {
      success: true,
      data: parsedData,
    };
  } catch (error) {
    console.error("Failed to parse or validate JSON canvas spec:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors };
    }
    return { success: false, error };
  }
}
