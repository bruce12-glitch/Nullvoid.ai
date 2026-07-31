"use client";

import { useEffect, useState, ReactNode, useCallback } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface WebGLErrorBoundaryProps {
  children: ReactNode;
}

export function WebGLErrorBoundary({ children }: WebGLErrorBoundaryProps) {
  const [isContextLost, setIsContextLost] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Find the canvas element and attach listeners directly (webglcontextlost does NOT bubble)
  const attachListeners = useCallback(() => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return null;

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      console.warn("WebGL Context Lost!");
      setIsContextLost(true);
    };

    const handleContextRestored = () => {
      console.log("WebGL Context Restored!");
      setIsContextLost(false);
    };

    canvas.addEventListener("webglcontextlost", handleContextLost, false);
    canvas.addEventListener("webglcontextrestored", handleContextRestored, false);

    return () => {
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      canvas.removeEventListener("webglcontextrestored", handleContextRestored);
    };
  }, []);

  useEffect(() => {
    // The canvas may not exist yet on mount, so we observe for it
    const cleanup = attachListeners();
    if (cleanup) return cleanup;

    const observer = new MutationObserver(() => {
      const cleanupFn = attachListeners();
      if (cleanupFn) {
        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
    };
  }, [attachListeners, retryCount]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="pointer-events-auto w-full h-full">
        {children}
      </div>
      
      {isContextLost && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md pointer-events-auto">
          <div className="bg-card border border-border/40 rounded-2xl p-8 shadow-2xl flex flex-col items-center max-w-sm text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">GPU Context Lost</h2>
              <p className="text-sm text-muted-foreground">
                Your graphics processor ran out of memory or restarted. The 3D scene will attempt to recover automatically.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Recovering...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
