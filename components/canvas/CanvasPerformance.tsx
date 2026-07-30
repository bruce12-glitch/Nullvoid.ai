"use client";

import { useState } from "react";
import { PerformanceMonitor, Html } from "@react-three/drei";
import { Activity, Cpu, MonitorPlay } from "lucide-react";
import { useThree } from "@react-three/fiber";
import { usePerformanceAdaptive } from "@/hooks/usePerformanceAdaptive";

export function CanvasPerformance() {
  const [dpr, setDpr] = useState(2);
  const [fps, setFps] = useState(60);
  const [quality, setQuality] = useState<"high" | "medium" | "low">("high");
  
  const { gl, scene } = useThree();
  const setPerformanceMetrics = usePerformanceAdaptive((state) => state.setPerformanceMetrics);

  return (
    <>
      <PerformanceMonitor 
        onIncline={() => {
          setDpr(2);
          setQuality("high");
          setPerformanceMetrics(2, "high", fps);
        }} 
        onDecline={() => {
          setDpr(1);
          setQuality("low");
          setPerformanceMetrics(1, "low", fps);
        }}
        onChange={({ fps }) => {
          setFps(Math.round(fps));
          // If bouncing between bounds
          if (fps > 45 && fps < 55) {
            setDpr(1.5);
            setQuality("medium");
            setPerformanceMetrics(1.5, "medium", Math.round(fps));
          } else {
            setPerformanceMetrics(dpr, quality, Math.round(fps));
          }
        }}
        flipflops={3}
        onFallback={() => {
          setDpr(1);
          setQuality("low");
          setPerformanceMetrics(1, "low", fps);
        }}
      />
      
      <Html
        position={[0, 0, 0]}
        zIndexRange={[0, 0]}
        style={{
          position: "fixed",
          bottom: "80px",
          left: "20px",
          pointerEvents: "none",
        }}
      >
        <div className="bg-card/80 backdrop-blur-md border border-border/40 rounded-xl p-3 text-xs w-48 shadow-2xl font-mono text-card-foreground">
          <div className="flex items-center gap-2 mb-2 font-semibold text-text-primary">
            <Activity className="w-3.5 h-3.5 text-accent-primary" />
            Performance HUD
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bg-bg-surface p-1.5 rounded-md border border-border-subtle">
              <span className="text-[10px] text-text-muted block mb-0.5 flex items-center gap-1">
                <MonitorPlay className="w-3 h-3" /> FPS
              </span>
              <span className={`font-bold ${fps < 30 ? "text-state-error" : fps < 50 ? "text-state-warning" : "text-state-success"}`}>
                {fps}
              </span>
            </div>
            
            <div className="bg-bg-surface p-1.5 rounded-md border border-border-subtle">
              <span className="text-[10px] text-text-muted block mb-0.5 flex items-center gap-1">
                <Cpu className="w-3 h-3" /> DPR
              </span>
              <span className="font-bold text-text-primary">
                {dpr.toFixed(2)}x
              </span>
            </div>

            <div className="bg-bg-surface p-1.5 rounded-md border border-border-subtle col-span-2">
              <span className="text-[10px] text-text-muted block mb-0.5">Render Quality</span>
              <span className="font-bold text-text-primary capitalize">
                {quality}
              </span>
            </div>
            
            <div className="bg-bg-surface p-1.5 rounded-md border border-border-subtle col-span-2 flex justify-between">
              <span className="text-[10px] text-text-muted">Draw Calls</span>
              <span className="font-bold text-text-primary">
                {gl.info.render.calls}
              </span>
            </div>
            
            <div className="bg-bg-surface p-1.5 rounded-md border border-border-subtle col-span-2 flex justify-between">
              <span className="text-[10px] text-text-muted">Geometries</span>
              <span className="font-bold text-text-primary">
                {gl.info.memory.geometries}
              </span>
            </div>
          </div>
        </div>
      </Html>
    </>
  );
}
