"use client";

import { Html } from "@react-three/drei";
import type { NodeCostItem } from "@/lib/analytics/cost-engine";

interface NodeCostBadgeProps {
  costItem: NodeCostItem;
  isVisible: boolean;
}

export function NodeCostBadge({ costItem, isVisible }: NodeCostBadgeProps) {
  if (!isVisible) return null;

  const isOutlier = costItem.isHighCostOutlier;

  return (
    <Html
      position={[0, 1.8, 0]}
      center
      zIndexRange={[0, 10]}
      style={{ pointerEvents: "none" }}
    >
      <div
        className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold whitespace-nowrap shadow-xl border transition-all ${
          isOutlier
            ? "bg-state-warning/90 text-bg-base border-state-warning"
            : "bg-bg-surface/90 text-accent-primary border-accent-primary/30"
        }`}
        style={{ backdropFilter: "blur(8px)" }}
      >
        ~${costItem.monthlyCost.toFixed(0)}/mo
        {isOutlier && <span className="ml-1 text-[9px]">⚠</span>}
      </div>
    </Html>
  );
}
