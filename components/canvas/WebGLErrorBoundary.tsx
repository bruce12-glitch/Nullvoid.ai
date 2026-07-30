"use client";

import { useEffect, useState, ReactNode, useRef } from "react";
import { AlertCircle } from "lucide-react";

interface WebGLErrorBoundaryProps {
  children: ReactNode;
}

export function WebGLErrorBoundary({ children }: WebGLErrorBoundaryProps) {
  const [isContextLost, setIsContextLost] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      console.warn("WebGL Context Lost!");
      setIsContextLost(true);
    };

    const handleContextRestored = () => {
      console.log("WebGL Context Restored!");
      setIsContextLost(false);
    };

    // WebGL events bubble up from the canvas to the container
    container.addEventListener("webglcontextlost", handleContextLost, false);
    container.addEventListener("webglcontextrestored", handleContextRestored, false);

    return () => {
      container.removeEventListener("webglcontextlost", handleContextLost);
      container.removeEventListener("webglcontextrestored", handleContextRestored);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      <div className="pointer-events-auto w-full h-full">
        {children}
      </div>
      
      {isContextLost && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md pointer-events-auto">
          <div className="bg-card border border-border/40 rounded-2xl p-6 shadow-2xl flex flex-col items-center max-w-sm text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">GPU Context Lost</h2>
              <p className="text-sm text-muted-foreground">
                Your graphics processor ran out of memory or restarted. We are attempting to recover the 3D scene...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
