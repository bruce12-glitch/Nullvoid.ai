"use client";

import { OrbitControls } from "@react-three/drei";
import { useCanvasPreferences } from "@/hooks/useCanvasPreferences";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

export function Camera() {
  const cameraInvertY = useCanvasPreferences((s) => s.cameraInvertY);
  const cameraFlyTo = useCanvasStore((s) => s.cameraFlyTo);
  const setCameraFlyTo = useCanvasStore((s) => s.setCameraFlyTo);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  
  const targetVec = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    if (cameraFlyTo && controlsRef.current) {
      targetVec.current.set(cameraFlyTo.x, cameraFlyTo.y, cameraFlyTo.z);
      
      controlsRef.current.target.lerp(targetVec.current, delta * 5);
      
      if (controlsRef.current.target.distanceTo(targetVec.current) < 0.1) {
        setCameraFlyTo(null);
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping={true}
      dampingFactor={0.05}
      minDistance={2}
      maxDistance={50}
      maxPolarAngle={Math.PI / 2 - 0.05}
      enablePan={true}
      enableZoom={true}
      rotateSpeed={cameraInvertY ? -0.5 : 0.5}
      mouseButtons={{
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
      }}
    />
  );
}
