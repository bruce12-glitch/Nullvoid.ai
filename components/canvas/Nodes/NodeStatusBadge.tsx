"use client";

import { Html } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { disposeThreeObject } from "@/lib/three-utils";

interface NodeStatusBadgeProps {
  label?: string;
  status?: "active" | "warning" | "error" | "idle";
}

const statusColors = {
  active: "#22c55e",
  warning: "#f59e0b",
  error: "#ef4444",
  idle: "#71717a",
};

export function NodeStatusBadge({ label, status = "idle" }: NodeStatusBadgeProps) {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const group = groupRef.current;
    return () => {
      disposeThreeObject(group);
    };
  }, []);

  return (
    <group ref={groupRef} position={[0, 1.8, 0]}>
      {/* Floating Indicator Sphere */}
      <mesh position={label ? [-0.5, 0, 0] : [0, 0, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial 
          color={statusColors[status]} 
          emissive={statusColors[status]} 
          emissiveIntensity={status !== "idle" ? 1.5 : 0} 
        />
      </mesh>

      {/* HTML Billboard */}
      {label && (
        <Html center position={[0.2, 0, 0]}>
          <div className="bg-card/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs text-foreground font-mono whitespace-nowrap border border-border/40 shadow-xl pointer-events-none">
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}
