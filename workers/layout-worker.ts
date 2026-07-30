import type { CanvasNode, CanvasEdge } from "@/types/canvas";
import dagre from "dagre";

interface LayoutWorkerData {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

self.onmessage = (event: MessageEvent<LayoutWorkerData>) => {
  const { nodes, edges } = event.data;

  // Initialize dagre graph
  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: "TB",
    nodesep: 4.0,
    ranksep: 4.0,
    align: "UL",
  });
  g.setDefaultEdgeLabel(() => ({}));

  const getTier = (type: string): number => {
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
  };

  nodes.forEach((node) => {
    g.setNode(node.id, { 
      width: 2.5, 
      height: 2.5,
      // @ts-ignore
      rank: getTier(node.type) 
    });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  // Run the layout algorithm
  dagre.layout(g);

  let minX = Infinity;
  let maxX = -Infinity;
  g.nodes().forEach((v) => {
    const n = g.node(v);
    if (n.x < minX) minX = n.x;
    if (n.x > maxX) maxX = n.x;
  });
  const centerX = (minX + maxX) / 2;

  // Build the result as a flat ArrayBuffer for max performance (zero-copy transfer)
  // We'll return [id (as string... wait, ArrayBuffer only does numbers easily)]
  // To keep it simple but thread-safe, we'll just post back the JSON objects,
  // but if we had 10k nodes, we'd use a Float32Array of [idHash, x, y, z].
  // For now, postMessage with standard structural cloning is extremely fast for <1000 nodes.
  
  const laidOutNodes = nodes.map((node) => {
    const dagreNode = g.node(node.id);
    const finalX = dagreNode.x - (isFinite(centerX) ? centerX : 0);
    const tier = getTier(node.type);
    const finalZ = -8 + (tier * 4);
    
    return {
      ...node,
      position: {
        x: finalX,
        y: 0, 
        z: finalZ,
      },
    };
  });

  self.postMessage(laidOutNodes);
};
