import dagre from "dagre";
import type { CanvasNode, CanvasEdge } from "@/types/canvas";

// Tier 0 → Z = -8 ... Tier 4 → Z = +8. Nodes of the same tier share a Z
// plane so the 3D layout reads as a clear top-to-bottom dependency flow.
function getTier(type: string): number {
  switch (type) {
    case "API_GATEWAY":
    case "LOAD_BALANCER":
    case "CDN":
    case "DNS":
      return 0; // Tier 0 (Z = -8)
    case "AUTH_PROVIDER":
    case "WEB_APP":
    case "CLIENT":
      return 1; // Tier 1 (Z = -4)
    case "SERVICE":
    case "MICROSERVICE":
    case "WORKER":
    case "ROBOT_UNIT":
    case "CUSTOM_3D":
      return 2; // Tier 2 (Z = 0)
    case "MESSAGE_QUEUE":
    case "REDIS":
    case "CACHE":
    case "KAFKA":
      return 3; // Tier 3 (Z = +4)
    case "DATABASE":
    case "STORAGE_BUCKET":
    case "SQL":
    case "NOSQL":
      return 4; // Tier 4 (Z = +8)
    default:
      return 2;
  }
}

function applyDagreLayout(
  nodes: CanvasNode[],
  edges: CanvasEdge[]
): CanvasNode[] {
  if (nodes.length === 0) return [];

  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: "TB",
    nodesep: 4.0,
    ranksep: 4.0,
    align: "UL",
  });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((node) => {
    g.setNode(node.id, { width: 2.5, height: 2.5 });
  });

  edges.forEach((edge) => {
    const source = edge.sourceNodeId ?? edge.source;
    const target = edge.targetNodeId ?? edge.target;
    if (source && target && source !== target) {
      g.setEdge(source, target);
    }
  });

  dagre.layout(g);

  let minX = Infinity;
  let maxX = -Infinity;
  g.nodes().forEach((v) => {
    const n = g.node(v);
    if (n.x < minX) minX = n.x;
    if (n.x > maxX) maxX = n.x;
  });
  const centerX = (minX + maxX) / 2;

  return nodes.map((node) => {
    const dagreNode = g.node(node.id);
    const tier = getTier(node.type);
    return {
      ...node,
      position: {
        x: dagreNode && isFinite(centerX) ? dagreNode.x - centerX : (node.position?.x ?? 0),
        y: dagreNode ? dagreNode.y : (node.position?.y ?? 0),
        z: -8 + tier * 4,
      },
      rotation: node.rotation ?? { x: 0, y: 0, z: 0 },
      scale: node.scale ?? { x: 1, y: 1, z: 1 },
    };
  });
}

// Dagre runs synchronously here. Trigger.dev tasks execute in Node where a
// web worker is unavailable, so a Worker-based layout would never run —
// calling dagre directly guarantees the layout is actually applied.
export async function applyLayoutEngine(
  nodes: CanvasNode[],
  edges: CanvasEdge[]
): Promise<CanvasNode[]> {
  return applyDagreLayout(nodes, edges);
}
