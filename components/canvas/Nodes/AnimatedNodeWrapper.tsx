import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface AnimatedNodeWrapperProps {
  children: React.ReactNode;
  targetPosition: [number, number, number];
}

export function AnimatedNodeWrapper({ children, targetPosition }: AnimatedNodeWrapperProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Start high in the sky (Y = +5)
  const [startY] = useState(() => targetPosition[1] + 5);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Lerp Y from startY down to target Y
      // We use a spring-like smooth approach by constantly lerping toward the target
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        targetPosition[1],
        delta * 6
      );
    }
  });

  return (
    <group 
      ref={groupRef}
      // Initialize X and Z to target, but Y to startY
      position={[targetPosition[0], startY, targetPosition[2]]}
    >
      {children}
    </group>
  );
}
