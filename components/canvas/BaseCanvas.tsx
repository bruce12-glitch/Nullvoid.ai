"use client";

import { useCallback } from "react";
import { useCanvasRaycaster } from "@/hooks/useCanvasRaycaster";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { useCanvasFSM } from "@/hooks/useCanvasFSM";

/**
 * Invisible ground plane that intercepts pointer events for 3D raycasting.
 * - onPointerMove: streams cursor3D updates into the Zustand store.
 * - onPointerDown on empty space: deselects all nodes.
 */
export function BaseCanvas() {
  const { raycast } = useCanvasRaycaster();
  const deselectAll = useCanvasStore((s) => s.deselectAll);
  const { state, send } = useCanvasFSM();

  const handlePointerMove = useCallback(
    (event: { clientX: number; clientY: number }) => {
      raycast(event);
    },
    [raycast]
  );

  const handlePointerDown = useCallback(
    (event: { clientX: number; clientY: number; stopPropagation: () => void }) => {
      // When clicking the empty ground, deselect everything unless locked
      if (state.matches("transforming") || state.matches("aiGenerating")) return;
      
      send({ type: "DESELECT_ALL" });
      deselectAll();
    },
    [deselectAll, state, send]
  );

  return (
    <>
      {/* 
        Large invisible plane at Y=0 to capture pointer events.
        receiveShadow keeps ContactShadows rendering correctly.
      */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.02, 0]}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        visible={false}
      >
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </>
  );
}
