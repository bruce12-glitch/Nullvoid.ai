"use client";

import { useCallback, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useCanvasStore } from "@/stores/useCanvasStore";

const GROUND_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const SNAP_UNIT = 0.5;

/**
 * Snaps a value to the nearest grid increment.
 */
function snap(value: number, unit: number): number {
  return Math.round(value / unit) * unit;
}

/**
 * Hook that performs mouse-to-3D raycasting against the Y=0 ground plane.
 *
 * Returns a `raycast` function that, given a PointerEvent, computes the
 * 3D world-space intersection point and optionally snaps to grid.
 */
export function useCanvasRaycaster() {
  const { camera, gl } = useThree();
  const canvasMode = useCanvasStore((s) => s.canvasMode);
  const setCursor3D = useCanvasStore((s) => s.setCursor3D);

  // Persistent objects to avoid GC churn every frame
  const raycaster = useRef(new THREE.Raycaster()).current;
  const mouse = useRef(new THREE.Vector2()).current;
  const intersection = useRef(new THREE.Vector3()).current;

  const raycast = useCallback(
    (event: { clientX: number; clientY: number }) => {
      const rect = gl.domElement.getBoundingClientRect();

      // Normalise mouse position to NDC (-1 to +1)
      mouse.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );

      raycaster.setFromCamera(mouse, camera);

      const hit = raycaster.ray.intersectPlane(GROUND_PLANE, intersection);
      if (!hit) return null;

      // Snap when placing or dragging
      const shouldSnap =
        canvasMode === "PLACING_NODE" || canvasMode === "SELECTING";

      const point = {
        x: shouldSnap ? snap(hit.x, SNAP_UNIT) : hit.x,
        y: 0,
        z: shouldSnap ? snap(hit.z, SNAP_UNIT) : hit.z,
      };

      setCursor3D(point);
      return point;
    },
    [camera, gl, canvasMode, raycaster, mouse, intersection, setCursor3D]
  );

  return { raycast };
}
