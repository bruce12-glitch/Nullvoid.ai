"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { useDisposal } from "@/hooks/useDisposal";

interface ServiceNodeProps {
  color?: string;
}

export function ServiceNode({ color = "#1f2937" }: ServiceNodeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const trimRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  useDisposal(groupRef);

  const nodeColor = useMemo(() => new THREE.Color(color), [color]);
  const accentColor = useMemo(() => new THREE.Color("#00c8d4"), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Pulsing accent trim
    if (trimRef.current) {
      const mat = trimRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.8 + Math.sin(t * 2) * 0.4;
    }

    // Subtle glow ring rotation
    if (glowRef.current) {
      glowRef.current.rotation.y = t * 0.5;
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.15 + Math.sin(t * 1.5) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.5, 0]}>
      {/* Main body - Physical material with clearcoat */}
      <RoundedBox args={[2, 1, 2]} radius={0.12} smoothness={4}>
        <meshPhysicalMaterial
          color={nodeColor}
          roughness={0.3}
          metalness={0.7}
          clearcoat={0.5}
          clearcoatRoughness={0.3}
          envMapIntensity={1.2}
        />
      </RoundedBox>

      {/* Top accent trim - emissive pulse */}
      <mesh ref={trimRef} position={[0, 0.51, 0]}>
        <boxGeometry args={[1.8, 0.03, 1.8]} />
        <meshStandardMaterial 
          color="#00c8d4" 
          emissive="#00c8d4" 
          emissiveIntensity={1}
          toneMapped={false}
        />
      </mesh>

      {/* Bottom accent trim */}
      <mesh position={[0, -0.51, 0]}>
        <boxGeometry args={[1.8, 0.02, 1.8]} />
        <meshStandardMaterial 
          color="#00c8d4" 
          emissive="#00c8d4" 
          emissiveIntensity={0.5}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Edge glow ring */}
      <mesh ref={glowRef} position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.3, 0.02, 8, 32]} />
        <meshBasicMaterial 
          color="#00c8d4" 
          transparent 
          opacity={0.15}
          toneMapped={false}
        />
      </mesh>

      {/* Vertical accent lines on corners */}
      {[[-0.9, 0, -0.9], [0.9, 0, -0.9], [-0.9, 0, 0.9], [0.9, 0, 0.9]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
          <meshStandardMaterial
            color="#00c8d4"
            emissive="#00c8d4"
            emissiveIntensity={0.6}
            transparent
            opacity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}
