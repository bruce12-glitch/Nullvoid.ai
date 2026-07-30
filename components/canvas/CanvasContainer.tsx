"use client";

import { useEffect, useState, useRef, useMemo, ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { isWebGPUSupported } from "@/lib/webgpu-check";
import * as THREE from "three";
import { WebGLErrorBoundary } from "./WebGLErrorBoundary";

interface CanvasContainerProps {
  children: ReactNode;
}

export function CanvasContainer({ children }: CanvasContainerProps) {
  const [hasWebGPU, setHasWebGPU] = useState<boolean | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [aspect, setAspect] = useState(1);

  useEffect(() => {
    isWebGPUSupported().then(setHasWebGPU);
  }, []);

  // ResizeObserver to track container aspect ratio
  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.height > 0) {
          setAspect(entry.contentRect.width / entry.contentRect.height);
        }
      }
    });
    
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Compute a base vertical FOV that adjusts on extreme widescreen vs tallscreen
  // We want to prevent objects from appearing too large/squished when resizing.
  const computedFov = useMemo(() => {
    const baseFov = 45;
    if (aspect < 1) {
      // In portrait, expand FOV slightly to keep content visible
      return baseFov * (1.2 / aspect);
    }
    return baseFov;
  }, [aspect]);

  // To prevent SSR mismatch and complex WebGPU module resolution errors in Next.js,
  // we initialize WebGPURenderer dynamically if supported, otherwise rely on WebGL2.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const glFactory = (props: any) => {
    // If WebGPU is supported, we dynamically load it (pseudo-logic for safety)
    if (hasWebGPU && props.canvas) {
      try {
        // Fallback WebGL2 (until three/webgpu is fully stable in R3F)
        return new THREE.WebGLRenderer({ canvas: props.canvas, antialias: true, alpha: true, powerPreference: "high-performance", preserveDrawingBuffer: true });
      } catch (e) {
        console.warn("WebGPU initialization failed, falling back to WebGL2", e);
      }
    }
    return new THREE.WebGLRenderer({ canvas: props.canvas, antialias: true, alpha: true, powerPreference: "high-performance", preserveDrawingBuffer: true });
  };

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[500px] overflow-hidden">
      <WebGLErrorBoundary>
        <Canvas
          shadows
          dpr={[1, 2]} // Support high-DPI without infinite scaling
          camera={{ position: [0, 6, 12], fov: computedFov, near: 0.1, far: 1000 }}
          gl={glFactory}
        >
          {children}
        </Canvas>
      </WebGLErrorBoundary>
      
      {/* Diagnostics */}
      <div className="absolute bottom-3 right-3 px-3 py-1 bg-card/80 backdrop-blur-md rounded-xl text-xs text-muted-foreground border border-border/40 pointer-events-none select-none z-0">
        Rendering: {hasWebGPU === null ? "Checking..." : hasWebGPU ? "WebGPU Supported (WebGL2 Active)" : "WebGL2 Standard"}
      </div>
    </div>
  );
}
