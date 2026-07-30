import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useMemo } from "react";

export function useFrustumCulling() {
  const { camera } = useThree();
  
  // Reuse objects to avoid GC overhead in useFrame
  const frustum = useMemo(() => new THREE.Frustum(), []);
  const projScreenMatrix = useMemo(() => new THREE.Matrix4(), []);

  // Expose a check function that can be called inside useFrame
  const updateFrustum = () => {
    projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(projScreenMatrix);
  };

  const isBoxVisible = (box: THREE.Box3) => {
    return frustum.intersectsBox(box);
  };

  const isPointVisible = (point: THREE.Vector3) => {
    return frustum.containsPoint(point);
  };
  
  const isSphereVisible = (sphere: THREE.Sphere) => {
    return frustum.intersectsSphere(sphere);
  };

  return { updateFrustum, isBoxVisible, isPointVisible, isSphereVisible };
}
