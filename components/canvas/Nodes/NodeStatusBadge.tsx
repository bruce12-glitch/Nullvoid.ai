"use client";

import { Html } from "@react-three/drei";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useDisposal } from "@/hooks/useDisposal";

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
  const sphereRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  useDisposal(groupRef);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Pulsing glow for active/error states
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      if (status === "active" || status === "error") {
        mat.opacity = 0.3 + Math.sin(t * 3) * 0.15;
        const s = 1.5 + Math.sin(t * 2) * 0.2;
        glowRef.current.scale.set(s, s, s);
      } else if (status === "warning") {
        mat.opacity = 0.2 + Math.sin(t * 2) * 0.1;
      } else {
        mat.opacity = 0.1;
      }
    }

    // Floating bob animation
    if (groupRef.current) {
      groupRef.current.position.y = 1.8 + Math.sin(t * 1.2) * 0.05;
    }
  });

  const color = statusColors[status];

  return (
    <group ref={groupRef} position={[0, 1.8, 0]}>
      {/* Glow halo */}
      <mesh ref={glowRef} position={label ? [-0.5, 0, 0] : [0, 0, 0]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.2}
          toneMapped={false}
        />
      </mesh>

      {/* Main indicator sphere */}
      <mesh ref={sphereRef} position={label ? [-0.5, 0, 0] : [0, 0, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={status !== "idle" ? 2 : 0}
          toneMapped={false}
        />
      </mesh>

      {/* HTML Billboard */}
      {label && (
        <Html center position={[0.2, 0, 0]}>
          <div className="px-2.5 py-1 rounded-lg text-[10px] font-mono whitespace-nowrap pointer-events-none select-none"
            style={{
              background: 'rgba(8, 8, 9, 0.85)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(42, 42, 48, 0.6)',
              color: '#f0f0f4',
              boxShadow: `0 4px 12px rgba(0, 0, 0, 0.4), 0 0 20px ${color}15`,
            }}
          >
            <span className="flex items-center gap-1.5">
              <span 
                className="w-1.5 h-1.5 rounded-full inline-block"
                style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
              />
              {label}
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}
