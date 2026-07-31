"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useDisposal } from "@/hooks/useDisposal";

interface DatabaseNodeProps {
  color?: string;
}

export function DatabaseNode({ color = "#1f2937" }: DatabaseNodeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const topCapRef = useRef<THREE.Mesh>(null);
  
  useDisposal(groupRef);

  const nodeColor = useMemo(() => new THREE.Color(color), [color]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Rotating ring
    if (ringRef.current) {
      ringRef.current.rotation.y = t * 0.8;
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.2 + Math.sin(t * 2) * 0.08;
    }

    // Top cap emissive pulse
    if (topCapRef.current) {
      const mat = topCapRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.6 + Math.sin(t * 1.5) * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.75, 0]}>
      {/* Top section */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[1, 1, 0.35, 32]} />
        <meshPhysicalMaterial
          color={nodeColor}
          roughness={0.25}
          metalness={0.8}
          clearcoat={0.8}
          clearcoatRoughness={0.2}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Top cap with emissive ring */}
      <mesh ref={topCapRef} position={[0, 0.68, 0]}>
        <cylinderGeometry args={[1.02, 1.02, 0.02, 32]} />
        <meshStandardMaterial 
          color="#00c8d4"
          emissive="#00c8d4"
          emissiveIntensity={0.8}
          toneMapped={false}
        />
      </mesh>

      {/* Middle section - transparent glass effect */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1, 1, 0.6, 32]} />
        <meshPhysicalMaterial
          color={nodeColor}
          roughness={0.15}
          metalness={0.6}
          transparent
          opacity={0.7}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={2}
        />
      </mesh>

      {/* Data flow ring */}
      <mesh ref={ringRef} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.15, 0.015, 8, 48]} />
        <meshBasicMaterial 
          color="#00c8d4" 
          transparent 
          opacity={0.25}
          toneMapped={false}
        />
      </mesh>

      {/* Bottom section */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[1, 1, 0.35, 32]} />
        <meshPhysicalMaterial
          color={nodeColor}
          roughness={0.25}
          metalness={0.8}
          clearcoat={0.8}
          clearcoatRoughness={0.2}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Bottom cap */}
      <mesh position={[0, -0.68, 0]}>
        <cylinderGeometry args={[1.02, 1.02, 0.02, 32]} />
        <meshStandardMaterial 
          color="#00c8d4"
          emissive="#00c8d4"
          emissiveIntensity={0.4}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Vertical accent lines */}
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
        <mesh key={i} position={[Math.cos(angle) * 0.95, 0, Math.sin(angle) * 0.95]}>
          <cylinderGeometry args={[0.015, 0.015, 1.2, 6]} />
          <meshStandardMaterial
            color="#00c8d4"
            emissive="#00c8d4"
            emissiveIntensity={0.5}
            transparent
            opacity={0.35}
          />
        </mesh>
      ))}
    </group>
  );
}
