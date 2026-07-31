"use client";

import { useEffect, useState, useRef, useMemo, ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { isWebGPUSupported } from "@/lib/webgpu-check";
import * as THREE from "three";
import { usePerformanceAdaptive } from "@/hooks/usePerformanceAdaptive";
import { WebGLErrorBoundary } from "./WebGLErrorBoundary";

interface CanvasContainerProps {
  children: ReactNode;
}

export function CanvasContainer({ children }: CanvasContainerProps) {
  const [hasWebGPU, setHasWebGPU] = useState<boolean | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [aspect, setAspect] = useState(1);

  // Adaptive DPR driven by the PerformanceMonitor inside the Canvas
  const adaptiveDpr = usePerformanceAdaptive((s) => s.dpr);

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
  const computedFov = useMemo(() => {
    const baseFov = 45;
    if (aspect < 1) {
      return baseFov * (1.2 / aspect);
    }
    return baseFov;
  }, [aspect]);

  const glFactory = (props: any) => {
    let renderer: THREE.WebGLRenderer;
    
    if (hasWebGPU && props.canvas) {
      try {
        renderer = new THREE.WebGLRenderer({ 
          canvas: props.canvas, 
          antialias: true, 
          alpha: true, 
          powerPreference: "high-performance", 
          preserveDrawingBuffer: true,
        });
      } catch (e) {
        console.warn("WebGPU initialization failed, falling back to WebGL2", e);
        renderer = new THREE.WebGLRenderer({ 
          canvas: props.canvas, 
          antialias: true, 
          alpha: true, 
          powerPreference: "high-performance", 
          preserveDrawingBuffer: true,
        });
      }
    } else {
      renderer = new THREE.WebGLRenderer({ 
        canvas: props.canvas, 
        antialias: true, 
        alpha: true, 
        powerPreference: "high-performance", 
        preserveDrawingBuffer: true,
      });
    }

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    return renderer;
  };

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[500px] overflow-hidden">
      <WebGLErrorBoundary>
        <Canvas
          shadows
          dpr={adaptiveDpr}
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
