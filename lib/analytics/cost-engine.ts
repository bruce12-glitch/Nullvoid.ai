import type { CanvasNode, CanvasEdge, NodeType } from "@/types/canvas";

// ── Cloud Provider Multipliers ─────────────────────────────────────────────
export type CloudProvider = "AWS" | "GCP" | "Azure";

const PROVIDER_MULTIPLIERS: Record<CloudProvider, number> = {
  AWS: 1.0,   // Baseline
  GCP: 0.88,  // ~12% cheaper than AWS on average
  Azure: 1.05, // ~5% more expensive than AWS on average
};

// ── Node Cost Models (baseline at 1M req/mo on AWS) ─────────────────────────
interface NodeCostModel {
  baseMonthly: number;
  perMillionRequests: number;
  perGBStorage?: number;
  description: string;
}

const NODE_COST_MODELS: Record<string, NodeCostModel> = {
  SERVICE: {
    baseMonthly: 22.50,
    perMillionRequests: 1.20,
    description: "Container instance (compute + egress)",
  },
  DATABASE: {
    baseMonthly: 45.00,
    perMillionRequests: 0.80,
    perGBStorage: 0.115,
    description: "Managed DB (compute + storage + I/O)",
  },
  API_GATEWAY: {
    baseMonthly: 5.00,
    perMillionRequests: 3.50,
    description: "API Gateway ($3.50/M requests)",
  },
  AUTH_PROVIDER: {
    baseMonthly: 18.00,
    perMillionRequests: 0.50,
    description: "Auth service (MAU-based pricing)",
  },
  MESSAGE_QUEUE: {
    baseMonthly: 8.00,
    perMillionRequests: 0.40,
    description: "Message queue ($0.40/M messages)",
  },
  STORAGE_BUCKET: {
    baseMonthly: 3.00,
    perMillionRequests: 0.023,
    perGBStorage: 0.023,
    description: "Object storage ($0.023/GB + egress)",
  },
  ROBOT_UNIT: {
    baseMonthly: 30.00,
    perMillionRequests: 2.00,
    description: "AI/ML compute instance",
  },
  CUSTOM_3D: {
    baseMonthly: 15.00,
    perMillionRequests: 1.00,
    description: "Custom service",
  },
};

// ── Cost Item (per node) ───────────────────────────────────────────────────
export interface NodeCostItem {
  nodeId: string;
  label: string;
  type: string;
  monthlyCost: number;
  percentageOfTotal: number;
  isHighCostOutlier: boolean;
  description: string;
}

// ── Traffic Scenarios ──────────────────────────────────────────────────────
export interface CostScenarios {
  bear: number;   // 100K req/mo
  base: number;   // 1M req/mo
  bull: number;   // 10M req/mo
  hypergrowth: number; // 100M req/mo
}

// ── Full Cost Report ───────────────────────────────────────────────────────
export interface SystemCostReport {
  totalMonthlyCost: number;
  itemizedCosts: NodeCostItem[];
  categoryBreakdown: {
    compute: number;
    database: number;
    networking: number;
    messaging: number;
    storage: number;
  };
  scenarios: CostScenarios;
  provider: CloudProvider;
  requestVolumeMillion: number;
}

// ── Core Cost Calculator ──────────────────────────────────────────────────
export function calculateTotalSystemCost(
  nodes: CanvasNode[],
  _edges: CanvasEdge[],
  requestVolumeMillion: number = 1,
  provider: CloudProvider = "AWS"
): SystemCostReport {
  const multiplier = PROVIDER_MULTIPLIERS[provider];
  const itemizedCosts: NodeCostItem[] = [];

  // First pass: compute raw costs
  const rawCosts = nodes.map((node) => {
    const model = NODE_COST_MODELS[node.type] ?? NODE_COST_MODELS.CUSTOM_3D;
    const replicaCount = (node.metadata?.replicaCount as number) ?? 1;
    const storageGB = (node.metadata?.storageGB as number) ?? 0;

    const base = model.baseMonthly * replicaCount;
    const requestCost = model.perMillionRequests * requestVolumeMillion;
    const storageCost = (model.perGBStorage ?? 0) * storageGB;

    const rawMonthly = base + requestCost + storageCost;
    const monthlyCost = +(rawMonthly * multiplier).toFixed(2);

    return { node, model, monthlyCost };
  });

  const totalMonthlyCost = rawCosts.reduce((sum, c) => sum + c.monthlyCost, 0);
  const outlierThreshold = totalMonthlyCost * 0.4;

  // Second pass: compute percentages and outlier flags
  rawCosts.forEach(({ node, model, monthlyCost }) => {
    const percentageOfTotal = totalMonthlyCost > 0
      ? +((monthlyCost / totalMonthlyCost) * 100).toFixed(1)
      : 0;

    itemizedCosts.push({
      nodeId: node.id,
      label: node.label ?? node.type,
      type: node.type,
      monthlyCost,
      percentageOfTotal,
      isHighCostOutlier: monthlyCost >= outlierThreshold && nodes.length > 1,
      description: model.description,
    });
  });

  // Category breakdown
  const categoryBreakdown = { compute: 0, database: 0, networking: 0, messaging: 0, storage: 0 };
  rawCosts.forEach(({ node, monthlyCost }) => {
    switch (node.type) {
      case "SERVICE":
      case "ROBOT_UNIT":
      case "CUSTOM_3D":
      case "AUTH_PROVIDER":
        categoryBreakdown.compute += monthlyCost;
        break;
      case "DATABASE":
        categoryBreakdown.database += monthlyCost;
        break;
      case "API_GATEWAY":
        categoryBreakdown.networking += monthlyCost;
        break;
      case "MESSAGE_QUEUE":
        categoryBreakdown.messaging += monthlyCost;
        break;
      case "STORAGE_BUCKET":
        categoryBreakdown.storage += monthlyCost;
        break;
    }
  });

  // Compute scenarios by linearly scaling req cost portion
  const computeScenario = (reqMil: number) => {
    return rawCosts.reduce((sum, { node, model }) => {
      const model_ = NODE_COST_MODELS[node.type] ?? NODE_COST_MODELS.CUSTOM_3D;
      const replicaCount = (node.metadata?.replicaCount as number) ?? 1;
      const storageGB = (node.metadata?.storageGB as number) ?? 0;
      const base = model_.baseMonthly * replicaCount;
      const reqCost = model_.perMillionRequests * reqMil;
      const storageCost = (model_.perGBStorage ?? 0) * storageGB;
      return sum + (base + reqCost + storageCost) * multiplier;
    }, 0);
  };

  const scenarios: CostScenarios = {
    bear: +computeScenario(0.1).toFixed(2),
    base: +computeScenario(1).toFixed(2),
    bull: +computeScenario(10).toFixed(2),
    hypergrowth: +computeScenario(100).toFixed(2),
  };

  return {
    totalMonthlyCost: +totalMonthlyCost.toFixed(2),
    itemizedCosts,
    categoryBreakdown: {
      compute: +categoryBreakdown.compute.toFixed(2),
      database: +categoryBreakdown.database.toFixed(2),
      networking: +categoryBreakdown.networking.toFixed(2),
      messaging: +categoryBreakdown.messaging.toFixed(2),
      storage: +categoryBreakdown.storage.toFixed(2),
    },
    scenarios,
    provider,
    requestVolumeMillion,
  };
}
