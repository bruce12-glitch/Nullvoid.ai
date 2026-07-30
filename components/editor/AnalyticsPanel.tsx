"use client";

import { useState, useMemo } from "react";
import { X, BarChart3, AlertTriangle, Cloud, TrendingUp, DollarSign, Zap, Server } from "lucide-react";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { calculateTotalSystemCost, type CloudProvider } from "@/lib/analytics/cost-engine";
import { simulateThroughput } from "@/lib/analytics/throughput-simulator";

// ── Category colors ──────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  compute: "#6457f9",
  database: "#00c8d4",
  networking: "#f59e0b",
  messaging: "#34d399",
  storage: "#f75f8f",
};

const PROVIDERS: CloudProvider[] = ["AWS", "GCP", "Azure"];

// ── Helper: format dollar amount ─────────────────────────────────────────────
const fmt = (n: number) =>
  n < 1000 ? `$${n.toFixed(2)}` : `$${(n / 1000).toFixed(1)}K`;

// ── Main Analytics Panel ─────────────────────────────────────────────────────
interface AnalyticsPanelProps {
  onClose: () => void;
}

export function AnalyticsPanel({ onClose }: AnalyticsPanelProps) {
  const { nodes, edges } = useCanvasStore();
  const [requestVolumeMillion, setRequestVolumeMillion] = useState(1);
  const [provider, setProvider] = useState<CloudProvider>("AWS");

  // Live-computed reports
  const costReport = useMemo(
    () => calculateTotalSystemCost(nodes, edges, requestVolumeMillion, provider),
    [nodes, edges, requestVolumeMillion, provider]
  );

  const simulation = useMemo(
    () => simulateThroughput(nodes, edges),
    [nodes, edges]
  );

  // Build breakdown entries sorted by cost
  const breakdown = Object.entries(costReport.categoryBreakdown)
    .sort((a, b) => b[1] - a[1])
    .filter(([, v]) => v > 0);

  const maxBreakdown = Math.max(...breakdown.map(([, v]) => v), 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto bg-black/40 backdrop-blur-sm">
      <div className="relative w-[680px] max-h-[85vh] overflow-y-auto bg-card/80 backdrop-blur-xl border border-border-default/40 rounded-3xl shadow-2xl p-6 text-card-foreground">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent-primary/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-accent-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">System Analytics</h2>
              <p className="text-[11px] text-text-muted">{nodes.length} nodes · {edges.length} connections</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-state-error rounded-xl hover:bg-bg-surface-elevated transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {nodes.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            <Server className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Add nodes to the canvas to see analytics</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">

            {/* ── Cloud Provider Toggle ─────────────────────────────────────── */}
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-text-muted shrink-0" />
              <span className="text-xs text-text-muted mr-2">Provider:</span>
              {PROVIDERS.map((p) => (
                <button
                  key={p}
                  onClick={() => setProvider(p)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    provider === p
                      ? "bg-accent-primary text-bg-base"
                      : "bg-bg-surface border border-border-default/50 text-text-muted hover:text-text-primary"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* ── Cost Overview ─────────────────────────────────────────────── */}
            <div className="bg-bg-surface border border-border-default/50 rounded-2xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Estimated Monthly Cost</p>
                  <p className="text-3xl font-bold text-text-primary font-mono">
                    {fmt(costReport.totalMonthlyCost)}
                    <span className="text-sm font-normal text-text-muted ml-1">/ mo</span>
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-accent-primary/30 mt-1" />
              </div>

              {/* Traffic Volume Slider */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] text-text-muted">Monthly Request Volume</label>
                  <span className="text-xs font-mono text-text-primary">
                    {requestVolumeMillion < 1
                      ? `${(requestVolumeMillion * 1000).toFixed(0)}K`
                      : requestVolumeMillion < 1000
                      ? `${requestVolumeMillion.toFixed(1)}M`
                      : `${(requestVolumeMillion / 1000).toFixed(0)}B`} req/mo
                  </span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={100}
                  step={0.1}
                  value={requestVolumeMillion}
                  onChange={(e) => setRequestVolumeMillion(parseFloat(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none bg-bg-surface-elevated cursor-pointer accent-accent-primary"
                />
                <div className="flex justify-between text-[10px] text-text-muted mt-1">
                  <span>100K</span>
                  <span>10M</span>
                  <span>100M</span>
                </div>
              </div>

              {/* Scenarios row */}
              <div className="grid grid-cols-4 gap-2 mt-4">
                {([
                  { label: "Bear", key: "bear" as const, color: "text-state-success" },
                  { label: "Base", key: "base" as const, color: "text-accent-primary" },
                  { label: "Bull", key: "bull" as const, color: "text-state-warning" },
                  { label: "100M RPS", key: "hypergrowth" as const, color: "text-state-error" },
                ] as const).map(({ label, key, color }) => (
                  <div key={key} className="bg-bg-surface-elevated rounded-xl p-2.5 text-center">
                    <p className="text-[10px] text-text-muted mb-1">{label}</p>
                    <p className={`text-sm font-bold font-mono ${color}`}>{fmt(costReport.scenarios[key])}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Cost Breakdown Bar Chart ──────────────────────────────────── */}
            {breakdown.length > 0 && (
              <div className="bg-bg-surface border border-border-default/50 rounded-2xl p-4">
                <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-4">
                  Spend Breakdown
                </h3>
                <div className="flex flex-col gap-2.5">
                  {breakdown.map(([category, cost]) => {
                    const pct = (cost / maxBreakdown) * 100;
                    const color = CATEGORY_COLORS[category] ?? "#808090";
                    return (
                      <div key={category} className="flex items-center gap-3">
                        <span className="text-xs text-text-muted capitalize w-20 shrink-0">{category}</span>
                        <div className="flex-1 h-2 rounded-full bg-bg-surface-elevated overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, backgroundColor: color }}
                          />
                        </div>
                        <span className="text-xs font-mono text-text-primary w-16 text-right shrink-0">{fmt(cost)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Itemized Node Costs ───────────────────────────────────────── */}
            <div className="bg-bg-surface border border-border-default/50 rounded-2xl p-4">
              <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-3">
                Itemized Node Costs
              </h3>
              <div className="flex flex-col gap-2">
                {costReport.itemizedCosts
                  .sort((a, b) => b.monthlyCost - a.monthlyCost)
                  .map((item) => (
                  <div
                    key={item.nodeId}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-all ${
                      item.isHighCostOutlier
                        ? "border-state-warning/40 bg-state-warning/5"
                        : "border-transparent bg-bg-surface-elevated"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {item.isHighCostOutlier && (
                        <AlertTriangle className="w-3 h-3 text-state-warning shrink-0" />
                      )}
                      <span className="text-xs text-text-primary font-medium">{item.label}</span>
                      <span className="text-[10px] text-text-muted font-mono bg-bg-subtle px-1.5 rounded">{item.type}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-text-muted">{item.percentageOfTotal}%</span>
                      <span className="text-xs font-bold font-mono text-text-primary">{fmt(item.monthlyCost)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Latency & Bottlenecks ─────────────────────────────────────── */}
            <div className="bg-bg-surface border border-border-default/50 rounded-2xl p-4">
              <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-accent-primary" />
                Performance Analysis
              </h3>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-bg-surface-elevated rounded-xl p-3 text-center">
                  <p className="text-[10px] text-text-muted mb-1">P50 Latency</p>
                  <p className="text-lg font-bold font-mono text-accent-primary">{simulation.estimatedP50LatencyMs}ms</p>
                </div>
                <div className="bg-bg-surface-elevated rounded-xl p-3 text-center">
                  <p className="text-[10px] text-text-muted mb-1">P99 Latency</p>
                  <p className="text-lg font-bold font-mono text-state-warning">{simulation.estimatedP99LatencyMs}ms</p>
                </div>
                <div className="bg-bg-surface-elevated rounded-xl p-3 text-center">
                  <p className="text-[10px] text-text-muted mb-1">Max Throughput</p>
                  <p className="text-lg font-bold font-mono text-state-success">
                    {simulation.estimatedMaxRps.toLocaleString()} RPS
                  </p>
                </div>
              </div>

              {/* Bottlenecks */}
              {simulation.bottlenecks.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {simulation.bottlenecks.map((b, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-2 p-2.5 rounded-xl border text-xs ${
                        b.severity === "critical"
                          ? "border-state-error/30 bg-state-error/5 text-state-error"
                          : "border-state-warning/30 bg-state-warning/5 text-state-warning"
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span className="leading-relaxed">{b.message}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-state-success">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>No significant bottlenecks detected. Architecture looks healthy.</span>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
