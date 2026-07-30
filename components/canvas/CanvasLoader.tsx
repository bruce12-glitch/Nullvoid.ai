"use client";

import { Html } from "@react-three/drei";

export function CanvasLoader() {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center gap-3">
        {/* A simple glassmorphic spinner CSS approach */}
        <div className="w-10 h-10 border-4 border-white/20 border-t-accent-primary rounded-full animate-spin shadow-[0_0_15px_rgba(0,200,212,0.5)]" />
        <span className="text-xs text-white/80 font-mono tracking-widest uppercase">Loading Assets...</span>
      </div>
    </Html>
  );
}
