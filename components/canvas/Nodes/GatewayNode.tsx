"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useDisposal } from "@/hooks/useDisposal";

interface GatewayNodeProps {
  color?: string;
}

export function GatewayNode({ color = "#1f2937" }: GatewayNodeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  const ringsRef = useRef<THREE.Group>(null);
  
  useDisposal(groupRef);

  const nodeColor = useMemo(() => new THREE.Color(color), [color]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Inner core rotation and pulsing
    if (coreRef.current) {
      coreRef.current.rotation.x = t * 0.8;
      coreRef.current.rotation.z = t * 0.5;
      const scale = 0.9 + Math.sin(t * 2) * 0.1;
      coreRef.current.scale.set(scale, scale, scale);
    }

    // Outer shell subtle rotation
    if (outerRef.current) {
      outerRef.current.rotation.y = -t * 0.3;
    }

    // Orbital rings
    if (ringsRef.current) {
      ringsRef.current.rotation.y = t * 0.4;
      ringsRef.current.rotation.x = Math.sin(t * 0.3) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, 1, 0]}>
      {/* Outer octahedron shell */}
      <mesh ref={outerRef}>
        <octahedronGeometry args={[1.2, 0]} />
        <meshPhysicalMaterial
          color={nodeColor}
          roughness={0.2}
          metalness={0.8}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transparent
          opacity={0.85}
          envMapIntensity={2}
        />
      </mesh>

      {/* Inner glowing core - wireframe */}
      <mesh ref={coreRef}>
        <octahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial 
          color="#00c8d4" 
          emissive="#00c8d4" 
          emissiveIntensity={3}
          wireframe
          toneMapped={false}
        />
      </mesh>

      {/* Core solid center */}
      <mesh>
        <octahedronGeometry args={[0.25, 0]} />
        <meshBasicMaterial 
          color="#00c8d4" 
          toneMapped={false}
        />
      </mesh>

      {/* Orbital rings */}
      <group ref={ringsRef}>
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[1.5, 0.015, 8, 48]} />
          <meshBasicMaterial 
            color="#6457f9" 
            transparent 
            opacity={0.3}
            toneMapped={false}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2.5, Math.PI / 4, 0]}>
          <torusGeometry args={[1.6, 0.01, 8, 48]} />
          <meshBasicMaterial 
            color="#00c8d4" 
            transparent 
            opacity={0.2}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Vertex glow points */}
      {[
        [0, 1.2, 0],
        [0, -1.2, 0],
        [1.2, 0, 0],
        [-1.2, 0, 0],
        [0, 0, 1.2],
        [0, 0, -1.2],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial 
            color="#00c8d4"
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
