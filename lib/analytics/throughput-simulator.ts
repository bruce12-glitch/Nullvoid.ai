import type { CanvasNode, CanvasEdge, EdgeType } from "@/types/canvas";

// ── Protocol Latency Overhead (ms) ────────────────────────────────────────
const PROTOCOL_LATENCY_MS: Record<string, number> = {
  GRPC: 1,
  SYNC_HTTP: 5,
  WEBSOCKET: 2,
  ASYNC_EVENT: 10,
  DATABASE_CONNECTION: 3,
};

// ── Bottleneck Warning ─────────────────────────────────────────────────────
export interface BottleneckWarning {
  severity: "warning" | "critical";
  message: string;
  path: string[];
  latencyMs: number;
}

// ── Simulation Result ──────────────────────────────────────────────────────
export interface ThroughputSimulation {
  estimatedP50LatencyMs: number;
  estimatedP99LatencyMs: number;
  estimatedMaxRps: number;
  criticalPath: string[];
  bottlenecks: BottleneckWarning[];
  edgeLatencies: Array<{ edgeId: string; latencyMs: number; protocol: string }>;
}

// ── Simple BFS to find longest path (approximate critical path) ───────────
function findCriticalPath(
  nodes: CanvasNode[],
  edges: CanvasEdge[]
): { path: string[]; totalLatencyMs: number } {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const adjList = new Map<string, Array<{ targetId: string; edgeType: string }>>();

  // Build adjacency list
  nodes.forEach((n) => adjList.set(n.id, []));
  edges.forEach((e) => {
    if (adjList.has(e.sourceNodeId)) {
      adjList.get(e.sourceNodeId)!.push({ targetId: e.targetNodeId, edgeType: e.type });
    }
  });

  // Find nodes with no incoming edges (sources)
  const hasIncoming = new Set(edges.map((e) => e.targetNodeId));
  const sources = nodes.filter((n) => !hasIncoming.has(n.id)).map((n) => n.id);

  let maxLatency = 0;
  let criticalPath: string[] = [];

  // DFS from each source to find the longest latency path
  const dfs = (nodeId: string, path: string[], currentLatency: number) => {
    const neighbors = adjList.get(nodeId) ?? [];
    if (neighbors.length === 0) {
      if (currentLatency > maxLatency) {
        maxLatency = currentLatency;
        criticalPath = [...path];
      }
      return;
    }
    for (const { targetId, edgeType } of neighbors) {
      const edgeLatency = PROTOCOL_LATENCY_MS[edgeType] ?? 5;
      dfs(targetId, [...path, targetId], currentLatency + edgeLatency);
    }
  };

  for (const source of sources) {
    dfs(source, [source], 0);
  }

  return { path: criticalPath, totalLatencyMs: maxLatency };
}

// ── Main Simulation Function ───────────────────────────────────────────────
export function simulateThroughput(
  nodes: CanvasNode[],
  edges: CanvasEdge[]
): ThroughputSimulation {
  if (nodes.length === 0) {
    return {
      estimatedP50LatencyMs: 0,
      estimatedP99LatencyMs: 0,
      estimatedMaxRps: 0,
      criticalPath: [],
      bottlenecks: [],
      edgeLatencies: [],
    };
  }

  // Compute per-edge latency
  const edgeLatencies = edges.map((e) => ({
    edgeId: e.id,
    latencyMs: PROTOCOL_LATENCY_MS[e.type] ?? 5,
    protocol: e.type,
  }));

  // Find critical path
  const { path: criticalPath, totalLatencyMs } = findCriticalPath(nodes, edges);

  // Base service processing time estimates (ms): average 20ms per service hop
  const serviceHops = criticalPath.length;
  const serviceProcessingMs = serviceHops * 20;

  const p50LatencyMs = +(serviceProcessingMs + totalLatencyMs).toFixed(1);
  const p99LatencyMs = +(p50LatencyMs * 2.8).toFixed(1); // P99 is roughly 2.8x P50 in distributed systems

  // Max RPS estimate: inverse of critical path latency in seconds, scaled by node parallelism
  const parallelismFactor = Math.max(1, Math.floor(nodes.length / 3));
  const estimatedMaxRps = p50LatencyMs > 0
    ? Math.floor((1000 / p50LatencyMs) * parallelismFactor * 10)
    : 50000;

  // Detect bottlenecks
  const bottlenecks: BottleneckWarning[] = [];

  // Flag SYNC_HTTP calls directly to DATABASE
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  edges.forEach((e) => {
    const target = nodeMap.get(e.targetNodeId);
    if (!target) return;

    // Un-cached DB over HTTP
    if (e.type === "SYNC_HTTP" && target.type === "DATABASE") {
      const source = nodeMap.get(e.sourceNodeId);
      bottlenecks.push({
        severity: "warning",
        message: `Synchronous HTTP call to uncached database detected: ${source?.label ?? e.sourceNodeId} → ${target.label ?? e.targetNodeId}. Consider adding a cache layer.`,
        path: [e.sourceNodeId, e.targetNodeId],
        latencyMs: PROTOCOL_LATENCY_MS.SYNC_HTTP,
      });
    }

    // ASYNC_EVENT at the gateway level (unusual)
    if (e.type === "ASYNC_EVENT") {
      const source = nodeMap.get(e.sourceNodeId);
      if (source?.type === "API_GATEWAY" || source?.type === "AUTH_PROVIDER") {
        bottlenecks.push({
          severity: "warning",
          message: `Async event from synchronous entry point: ${source?.label ?? e.sourceNodeId} uses ASYNC_EVENT which adds queue delay (${PROTOCOL_LATENCY_MS.ASYNC_EVENT}ms overhead).`,
          path: [e.sourceNodeId, e.targetNodeId],
          latencyMs: PROTOCOL_LATENCY_MS.ASYNC_EVENT,
        });
      }
    }
  });

  // Flag high-latency critical path
  if (p50LatencyMs > 200) {
    bottlenecks.push({
      severity: "critical",
      message: `High latency critical path detected (${p50LatencyMs}ms P50). Consider parallelizing synchronous chains or adding edge caching.`,
      path: criticalPath,
      latencyMs: p50LatencyMs,
    });
  }

  return {
    estimatedP50LatencyMs: p50LatencyMs,
    estimatedP99LatencyMs: p99LatencyMs,
    estimatedMaxRps,
    criticalPath,
    bottlenecks,
    edgeLatencies,
  };
}
