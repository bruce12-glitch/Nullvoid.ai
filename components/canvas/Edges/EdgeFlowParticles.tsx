"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface EdgeFlowParticlesProps {
  start: THREE.Vector3;
  mid: THREE.Vector3;
  end: THREE.Vector3;
  color: string;
}

const PARTICLE_COUNT = 4;

export function EdgeFlowParticles({ start, mid, end, color }: EdgeFlowParticlesProps) {
  const meshRefs = useRef<THREE.Mesh[]>([]);
  const progressRefs = useRef<number[]>(Array.from({ length: PARTICLE_COUNT }, (_, i) => i / PARTICLE_COUNT));
  
  const curve = useMemo(() => {
    return new THREE.QuadraticBezierCurve3(start, mid, end);
  }, [start, mid, end]);

  const colorObj = useMemo(() => new THREE.Color(color), [color]);

  useFrame((_, delta) => {
    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      
      progressRefs.current[i] += delta * (0.3 + i * 0.08);
      if (progressRefs.current[i] > 1) {
        progressRefs.current[i] -= 1;
      }

      const position = curve.getPointAt(progressRefs.current[i]);
      mesh.position.copy(position);

      // Pulse scale
      const pulse = 0.8 + Math.sin(progressRefs.current[i] * Math.PI * 4 + i) * 0.3;
      mesh.scale.setScalar(pulse);
    });
  });

  return (
    <group>
      {Array.from({ length: PARTICLE_COUNT }, (_, i) => (
        <group key={i}>
          {/* Main particle */}
          <mesh
            ref={(el) => { if (el) meshRefs.current[i] = el; }}
          >
            <sphereGeometry args={[0.06 - i * 0.008, 12, 12]} />
            <meshBasicMaterial color={color} toneMapped={false} />
          </mesh>
          
          {/* Glow halo */}
          <mesh
            position={[
              curve.getPointAt(progressRefs.current[i]).x,
              curve.getPointAt(progressRefs.current[i]).y,
              curve.getPointAt(progressRefs.current[i]).z,
            ]}
            scale={[2.5, 2.5, 2.5]}
          >
            <sphereGeometry args={[0.06 - i * 0.008, 8, 8]} />
            <meshBasicMaterial 
              color={color} 
              transparent 
              opacity={0.2 - i * 0.03}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
