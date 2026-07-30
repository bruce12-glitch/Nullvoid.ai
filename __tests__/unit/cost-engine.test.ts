import { expect, test, describe } from "vitest";
import { calculateTotalSystemCost } from "@/lib/analytics/cost-engine";
import type { CanvasNode } from "@/types/canvas";

describe("calculateTotalSystemCost", () => {
  test("Calculates correct baseline cost for a single service node on AWS", () => {
    const nodes: CanvasNode[] = [
      {
        id: "n1",
        type: "SERVICE",
        position: { x: 0, y: 0, z: 0 },
        data: { label: "Test Node" },
        metadata: { replicaCount: 1 }
      }
    ];
    
    // AWS baseline for SERVICE: $22.50 base + 1.20 per M reqs. 
    // Request volume = 1M
    const report = calculateTotalSystemCost(nodes, [], 1, "AWS");
    
    expect(report.totalMonthlyCost).toBe(23.70); // 22.50 + 1.20
    expect(report.itemizedCosts.length).toBe(1);
    expect(report.itemizedCosts[0].percentageOfTotal).toBe(100);
  });

  test("Applies GCP discount multiplier correctly", () => {
    const nodes: CanvasNode[] = [
      {
        id: "n1",
        type: "SERVICE",
        position: { x: 0, y: 0, z: 0 },
        data: { label: "Test Node GCP" },
        metadata: { replicaCount: 1 }
      }
    ];
    
    const reportAWS = calculateTotalSystemCost(nodes, [], 1, "AWS");
    const reportGCP = calculateTotalSystemCost(nodes, [], 1, "GCP");
    
    // GCP multiplier is 0.88
    expect(reportGCP.totalMonthlyCost).toBeCloseTo(reportAWS.totalMonthlyCost * 0.88, 1);
  });

  test("Identifies high cost outliers", () => {
    const nodes: CanvasNode[] = [
      {
        id: "n1",
        type: "DATABASE",
        position: { x: 0, y: 0, z: 0 },
        data: { label: "Test DB" },
        metadata: { storageGB: 1000 } // high storage cost
      },
      {
        id: "n2",
        type: "API_GATEWAY",
        data: { label: "Test Gateway" },
        position: { x: 0, y: 0, z: 0 }
      }
    ];

    const report = calculateTotalSystemCost(nodes, [], 1, "AWS");
    const dbItem = report.itemizedCosts.find(c => c.nodeId === "n1");
    const apiItem = report.itemizedCosts.find(c => c.nodeId === "n2");
    
    expect(dbItem?.isHighCostOutlier).toBe(true);
    expect(apiItem?.isHighCostOutlier).toBe(false);
  });
});
