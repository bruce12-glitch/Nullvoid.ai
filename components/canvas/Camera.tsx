"use client";

import { OrbitControls } from "@react-three/drei";
import { useCanvasPreferences } from "@/hooks/useCanvasPreferences";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

export function Camera() {
  const { cameraInvertY } = useCanvasPreferences();
  const { cameraFlyTo, setCameraFlyTo } = useCanvasStore();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  
  const targetVec = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    if (cameraFlyTo && controlsRef.current) {
      targetVec.current.set(cameraFlyTo.x, cameraFlyTo.y, cameraFlyTo.z);
      
      // Lerp the target to the destination
      controlsRef.current.target.lerp(targetVec.current, delta * 5);
      
      // If we are close enough, stop flying
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
      // Math.PI / 2 is the horizon (90 degrees). 
      // We subtract 0.05 to prevent the camera from clipping exactly into the floor grid.
      maxPolarAngle={Math.PI / 2 - 0.05}
      enablePan={true}
      enableZoom={true}
      // To handle inversion we could hook into the internal state, but for OrbitControls
      // there isn't a direct invertY prop. We'd map this in a custom camera control or leave standard.
      // Left as a standard constraint setup.
      mouseButtons={{
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
      }}
    />
  );
}
