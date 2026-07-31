"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface AnimatedNodeWrapperProps {
  children: React.ReactNode;
  targetPosition: [number, number, number];
}

export function AnimatedNodeWrapper({ children, targetPosition }: AnimatedNodeWrapperProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [isSpawned, setIsSpawned] = useState(false);

  // Persistent destination so drag updates never re-apply the spawn Y.
  const target = useRef(new THREE.Vector3(...targetPosition));
  // Start high in the sky and small (only used on mount)
  const startY = useRef(targetPosition[1] + 6);
  const spawnProgress = useRef(0);
  const hasSpawnedRef = useRef(false);

  // Set the initial spawn position exactly once (mount only).
  useEffect(() => {
    if (groupRef.current && !hasSpawnedRef.current) {
      hasSpawnedRef.current = true;
      groupRef.current.position.set(targetPosition[0], startY.current, targetPosition[2]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track the live destination so gizmo/Inspector drags are followed smoothly.
  useEffect(() => {
    target.current.set(targetPosition[0], targetPosition[1], targetPosition[2]);
  }, [targetPosition]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const pos = groupRef.current.position;

    // Position: lerp from sky to target (X/Y/Z) so drags animate, never snap.
    pos.x = THREE.MathUtils.lerp(pos.x, target.current.x, delta * 5);
    pos.y = THREE.MathUtils.lerp(pos.y, target.current.y, delta * 5);
    pos.z = THREE.MathUtils.lerp(pos.z, target.current.z, delta * 5);

    // Scale: pop-in from 0 to 1 with overshoot
    if (!isSpawned) {
      spawnProgress.current = Math.min(spawnProgress.current + delta * 3, 1);

      // Elastic ease-out
      const t = spawnProgress.current;
      const scale = t === 1 ? 1 : 1 - Math.pow(2, -10 * t) * Math.cos((t * 10 - 0.75) * ((2 * Math.PI) / 3));

      groupRef.current.scale.set(scale, scale, scale);

      // Rotation: spin in from 180 degrees
      groupRef.current.rotation.y = (1 - t) * Math.PI;

      if (spawnProgress.current >= 1) {
        setIsSpawned(true);
        groupRef.current.rotation.y = 0;
      }
    }
  });

  // NOTE: no `position` prop here — R3F would re-apply it on every render
  // (resetting Y to the sky spawn height during gizmo drags). Initial placement
  // is handled once in the mount effect, and useFrame lerps toward the target.
  return (
    <group ref={groupRef}>
      {children}
    </group>
  );
}
