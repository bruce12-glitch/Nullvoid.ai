"use client";

import { useState, useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { usePerformanceAdaptive } from "@/hooks/usePerformanceAdaptive";
import { useFrustumCulling } from "@/hooks/useFrustumCulling";
import { Html } from "@react-three/drei";

interface LODNodeProps {
  id: string;
  position: [number, number, number];
  label?: string;
  children: React.ReactNode;
}

export function LODNode({ id, position, label, children }: LODNodeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [lodLevel, setLodLevel] = useState<"high" | "medium" | "low" | "culled">("high");
  
  const { camera } = useThree();
  const { quality } = usePerformanceAdaptive();
  const { updateFrustum, isSphereVisible } = useFrustumCulling();

  // Pre-allocate for performance
  const vec = useMemo(() => new THREE.Vector3(...position), [position]);
  const sphere = useMemo(() => new THREE.Sphere(vec, 3), [vec]);

  useFrame(() => {
    if (!groupRef.current) return;
    
    // 1. Frustum culling check
    updateFrustum();
    if (!isSphereVisible(sphere)) {
      if (lodLevel !== "culled") setLodLevel("culled");
      return;
    }

    // 2. Distance LOD check
    const distance = camera.position.distanceTo(vec);
    
    // Adjust thresholds based on system performance tier
    const thresholdMult = quality === "high" ? 1 : quality === "medium" ? 0.75 : 0.5;
    
    if (distance < 15 * thresholdMult) {
      if (lodLevel !== "high") setLodLevel("high");
    } else if (distance < 35 * thresholdMult) {
      if (lodLevel !== "medium") setLodLevel("medium");
    } else {
      if (lodLevel !== "low") setLodLevel("low");
    }
  });

  if (lodLevel === "culled" || lodLevel === "low") {
    // Return null, as the InstancedNodes layer will handle rendering these faraway/culled nodes
    return (
      <group ref={groupRef} position={position} />
    );
  }

  return (
    <group ref={groupRef} position={position}>
      {/* High Quality: Full children + HTML Label */}
      {lodLevel === "high" && (
        <>
          {children}
          {label && (
            <Html position={[0, -2, 0]} center zIndexRange={[0, 0]} style={{ pointerEvents: "none" }}>
              <div className="bg-card/80 backdrop-blur-md px-2 py-1 rounded text-[10px] font-mono border border-border/40 whitespace-nowrap text-text-primary">
                {label}
              </div>
            </Html>
          )}
        </>
      )}

      {/* Medium Quality: Full children, no HTML Label to save DOM nodes */}
      {lodLevel === "medium" && children}
    </group>
  );
}
