"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { useDisposal } from "@/hooks/useDisposal";

interface ServiceNodeProps {
  color?: string;
}

export function ServiceNode({ color = "#1f2937" }: ServiceNodeProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  useDisposal(groupRef);

  return (
    <group ref={groupRef} position={[0, 0.5, 0]}>
      <RoundedBox args={[2, 1, 2]} radius={0.1} smoothness={4}>
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      </RoundedBox>
      {/* Cyan accent trim */}
      <mesh position={[0, 0.51, 0]}>
        <boxGeometry args={[1.8, 0.02, 1.8]} />
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}
