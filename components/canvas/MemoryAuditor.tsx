"use client";

import { useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";

export function MemoryAuditor() {
  const gl = useThree((state) => state.gl);
  const [stats, setStats] = useState({
    geometries: 0,
    textures: 0,
    drawCalls: 0,
    triangles: 0,
  });

  useFrame(() => {
    // Throttle React state updates to prevent excessive re-renders
    if (Date.now() % 500 < 20) {
      setStats({
        geometries: gl.info.memory.geometries,
        textures: gl.info.memory.textures,
        drawCalls: gl.info.render.calls,
        triangles: gl.info.render.triangles,
      });
    }
  });

  // Only render in development environments to prevent production UI clutter
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <Html position={[0, 0, 0]} zIndexRange={[100, 0]} className="pointer-events-none select-none">
      <div className="fixed top-24 left-4 bg-background/90 backdrop-blur border border-border p-4 rounded-xl shadow-lg w-56 text-xs text-foreground space-y-2 font-mono">
        <h3 className="font-bold text-sm mb-2 border-b border-border pb-1">GPU Memory Auditor</h3>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Geometries:</span>
          <span className={stats.geometries > 500 ? "text-red-500 font-bold" : "text-green-500"}>{stats.geometries}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Textures:</span>
          <span className={stats.textures > 100 ? "text-red-500 font-bold" : "text-green-500"}>{stats.textures}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Draw Calls:</span>
          <span className={stats.drawCalls > 200 ? "text-amber-500 font-bold" : "text-blue-500"}>{stats.drawCalls}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Triangles:</span>
          <span>{stats.triangles.toLocaleString()}</span>
        </div>
      </div>
    </Html>
  );
}
