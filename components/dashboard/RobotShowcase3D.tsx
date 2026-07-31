"use client";

import { useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { RobotNode } from "@/components/canvas/Nodes/RobotNode";

const SHOWCASE_SCALE = 0.3;

function ShowcaseRig() {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.25;
    group.current.position.y =
      Math.sin(state.clock.getElapsedTime() * 1.2) * 0.08 + 0.1;
  });

  return (
    <group ref={group} position={[0, 0.1, 0]}>
      <RobotNode scale={SHOWCASE_SCALE} />
    </group>
  );
}

export function RobotShowcase3D() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 1.2, 7.5], fov: 42, near: 0.1, far: 100 }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.5} />

      {/* Soft key light */}
      <directionalLight position={[6, 10, 8]} intensity={1.4} />

      {/* Cyan rim light */}
      <directionalLight position={[-8, 4, -6]} intensity={1.2} color="#00c8d4" />

      {/* Purple back light */}
      <directionalLight position={[4, 2, -8]} intensity={0.8} color="#6457f9" />

      {/* Ground bounce */}
      <pointLight position={[0, -2, 0]} intensity={0.4} color="#00c8d4" distance={10} decay={2} />

      <ShowcaseRig />

      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.55}
        scale={14}
        blur={2.5}
        far={10}
        resolution={512}
        color="#000000"
      />
    </Canvas>
  );
}
