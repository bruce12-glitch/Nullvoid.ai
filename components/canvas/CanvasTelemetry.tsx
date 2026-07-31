"use client";

import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import posthog from "posthog-js";

const REPORT_INTERVAL_MS = 30000;
const FPS_SAMPLE_WINDOW = 60;

export function CanvasTelemetry() {
  const gl = useThree((state) => state.gl);
  const frames = useRef(0);
  const lastFpsTime = useRef(0);
  const fpsBuffer = useRef<number[]>([]);
  const peakGeometries = useRef(0);
  const peakTextures = useRef(0);
  const peakDrawCalls = useRef(0);
  const contextLossCount = useRef(0);

  useFrame(() => {
    frames.current++;

    const now = performance.now();
    const elapsed = now - lastFpsTime.current;

    if (elapsed >= 1000) {
      const fps = Math.round((frames.current * 1000) / elapsed);
      fpsBuffer.current.push(fps);

      if (fpsBuffer.current.length > FPS_SAMPLE_WINDOW) {
        fpsBuffer.current.shift();
      }

      frames.current = 0;
      lastFpsTime.current = now;
    }

    const geo = gl.info.memory.geometries;
    const tex = gl.info.memory.textures;
    const calls = gl.info.render.calls;

    if (geo > peakGeometries.current) peakGeometries.current = geo;
    if (tex > peakTextures.current) peakTextures.current = tex;
    if (calls > peakDrawCalls.current) peakDrawCalls.current = calls;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !process.env.NEXT_PUBLIC_POSTHOG_KEY) return;

    const canvas = gl.domElement;

    const handleContextLost = () => {
      contextLossCount.current++;
    };

    canvas.addEventListener("webglcontextlost", handleContextLost);

    const interval = setInterval(() => {
      const buffer = fpsBuffer.current;
      if (buffer.length === 0) return;

      const avgFps = Math.round(buffer.reduce((a, b) => a + b, 0) / buffer.length);

      posthog.capture("canvas_performance_3d", {
        average_fps: avgFps,
        webgl_context_losses: contextLossCount.current,
        peak_geometries: peakGeometries.current,
        peak_textures: peakTextures.current,
        peak_draw_calls: peakDrawCalls.current,
      });
    }, REPORT_INTERVAL_MS);

    return () => {
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      clearInterval(interval);
    };
  }, [gl]);

  return null;
}
