"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useDisposal } from "@/hooks/useDisposal";

interface GatewayNodeProps {
  color?: string;
}

export function GatewayNode({ color = "#1f2937" }: GatewayNodeProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  useDisposal(groupRef);

  return (
    <group ref={groupRef} position={[0, 1, 0]}>
      <mesh>
        <octahedronGeometry args={[1.2, 0]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Inner glowing core */}
      <mesh>
        <octahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={2} wireframe />
      </mesh>
    </group>
  );
}
