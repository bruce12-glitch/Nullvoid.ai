"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useDisposal } from "@/hooks/useDisposal";

interface DatabaseNodeProps {
  color?: string;
}

export function DatabaseNode({ color = "#1f2937" }: DatabaseNodeProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  useDisposal(groupRef);

  return (
    <group ref={groupRef} position={[0, 0.75, 0]}>
      {/* Top section */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[1, 1, 0.4, 32]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Middle section */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1, 1, 0.4, 32]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Bottom section */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[1, 1, 0.4, 32]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      </mesh>
    </group>
  );
}
