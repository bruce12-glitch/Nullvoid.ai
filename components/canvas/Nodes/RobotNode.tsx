"use client";

import { Suspense, useRef } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { useDisposal } from "@/hooks/useDisposal";
import { ErrorBoundary } from "react-error-boundary";

const ROBOT_URL = "/assets/3D/robot_playground.glb";

function RobotModel({ scale }: { scale: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(ROBOT_URL);

  // Cleanup WebGL resources on unmount
  useDisposal(groupRef);

  return (
    <group ref={groupRef} dispose={null} scale={scale}>
      <primitive object={scene} />
    </group>
  );
}

// Warm the cache so the model is ready when first rendered
useGLTF.preload(ROBOT_URL);

interface RobotNodeProps {
  /** Uniform scale applied to the model (canvas nodes use ~0.05, showcases use ~0.3+) */
  scale?: number;
}

export function RobotNode({ scale = 0.05 }: RobotNodeProps) {
  return (
    <ErrorBoundary
      fallback={
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#6366f1" roughness={0.2} metalness={0.8} />
        </mesh>
      }
    >
      <Suspense fallback={null}>
        <RobotModel scale={scale} />
      </Suspense>
    </ErrorBoundary>
  );
}
