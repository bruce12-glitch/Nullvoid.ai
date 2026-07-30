"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useGLTF, Html } from "@react-three/drei";
import { useDisposal } from "@/hooks/useDisposal";
import { ErrorBoundary } from "react-error-boundary";

function RobotModel() {
  const groupRef = useRef<THREE.Group>(null);
  
  // NOTE: If public/assets/3D/robot_playground.glb does not exist, useGLTF will throw.
  // We wrap this in an ErrorBoundary in the parent to catch the suspension crash.
  const { scene } = useGLTF("/assets/3D/robot_playground.glb");

  // Cleanup WebGL resources on unmount
  useDisposal(groupRef);

  return (
    <group ref={groupRef} dispose={null}>
      <primitive object={scene} />
    </group>
  );
}

// Preload the GLTF file to avoid pop-in
// In a real scenario, this throws an error immediately if the file is missing,
// so for safety in this development phase we wrap the preload in a try/catch, 
// or simply let it fail gracefully if the file isn't there.
try {
  useGLTF.preload("/assets/3D/robot_playground.glb");
} catch (e) {
  console.warn("Failed to preload robot_playground.glb", e);
}

import { LODNode } from "./LODNode";

export function RobotNode() {
  return (
    <LODNode id="robot-node-1" position={[0, 0, 0]} label="AI Assistant">
      <ErrorBoundary 
        fallback={
          <mesh position={[0, 1, 0]}>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial color="#6366f1" roughness={0.2} metalness={0.8} />
            <Html center position={[0, 1.5, 0]}>
              <div className="bg-card/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs text-foreground whitespace-nowrap border border-border/40 shadow-xl">
                Missing robot_playground.glb
              </div>
            </Html>
          </mesh>
        }
      >
        <RobotModel />
      </ErrorBoundary>
    </LODNode>
  );
}
