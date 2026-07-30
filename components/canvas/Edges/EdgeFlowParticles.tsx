"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useDisposal } from "@/hooks/useDisposal";

interface EdgeFlowParticlesProps {
  start: THREE.Vector3;
  mid: THREE.Vector3;
  end: THREE.Vector3;
  color: string;
}

export function EdgeFlowParticles({ start, mid, end, color }: EdgeFlowParticlesProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const curve = useMemo(() => {
    return new THREE.QuadraticBezierCurve3(start, mid, end);
  }, [start, mid, end]);

  const progressRef = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    progressRef.current += delta * 0.5;
    if (progressRef.current > 1) {
      progressRef.current -= 1;
    }

    // getPointAt returns a point at a percentage of the curve length
    const position = curve.getPointAt(progressRef.current);
    meshRef.current.position.copy(position);
  });

  useDisposal(meshRef);

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshBasicMaterial color={color} />
      
      <mesh scale={[1.8, 1.8, 1.8]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>
    </mesh>
  );
}
