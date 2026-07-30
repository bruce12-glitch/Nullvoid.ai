import { useEffect } from "react";
import * as THREE from "three";
import { disposeThreeObject } from "@/lib/three-utils";

/**
 * A reusable React hook that automatically executes `disposeThreeObject`
 * on the target Three.js object upon component unmount, preventing WebGL
 * memory leaks.
 *
 * @param ref - The React RefObject containing the THREE.Object3D to dispose.
 */
export function useDisposal(ref: React.RefObject<THREE.Object3D | null>) {
  useEffect(() => {
    const object = ref.current;
    return () => {
      if (object) {
        disposeThreeObject(object);
      }
    };
  }, [ref]);
}
