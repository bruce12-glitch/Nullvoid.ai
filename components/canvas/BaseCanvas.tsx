"use client";

import { useCallback } from "react";
import { useCanvasRaycaster } from "@/hooks/useCanvasRaycaster";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { useCanvasFSM } from "@/hooks/useCanvasFSM";
import { useCanvasTools } from "@/hooks/useCanvasTools";
import { useInsertNodeCRDT } from "@/hooks/useLiveblocksCanvasSync";
import type { CanvasNode, NodeType } from "@/types/canvas";

/**
 * Invisible ground plane that intercepts pointer events for 3D raycasting.
 * - onPointerMove: streams cursor3D updates into the Zustand store.
 * - onPointerDown on empty space: deselects all nodes (unless multi-selecting).
 * - onPointerDown while placingNode: drops a new node at the cursor.
 */
export function BaseCanvas() {
  const { raycast } = useCanvasRaycaster();
  const deselectAll = useCanvasStore((s) => s.deselectAll);
  const addNode = useCanvasStore((s) => s.addNode);
  const { state, send } = useCanvasFSM();
  const insertNodeCRDT = useInsertNodeCRDT();

  const handlePointerMove = useCallback(
    (event: { clientX: number; clientY: number }) => {
      raycast(event);
    },
    [raycast]
  );

  const handlePointerDown = useCallback(
    (event: { shiftKey: boolean; metaKey: boolean; ctrlKey: boolean }) => {
      if (state.matches("transforming") || state.matches("aiGenerating")) return;

      // Placing a node: drop it at the current cursor position.
      if (state.matches("placingNode")) {
        const { cursor3D, activeNodeTypeToPlace, setActiveNodeTypeToPlace } = useCanvasStore.getState();
        const type: NodeType = activeNodeTypeToPlace || "SERVICE";
        const newNode: CanvasNode = {
          id: `node-${Date.now()}`,
          type,
          label: "New Node",
          position: { x: cursor3D.x, y: 0, z: cursor3D.z },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          status: "idle",
          data: { label: "New Node" },
          _justAdded: true,
        };

        insertNodeCRDT?.(newNode);
        addNode(newNode);

        // Exit placing mode and return to the Select tool.
        send({ type: "CANCEL" });
        setActiveNodeTypeToPlace(null);
        useCanvasTools.getState().setActiveTool("SELECT");
        return;
      }

      // Connecting mode: clicking empty ground cancels the pending connection.
      if (state.matches("connecting")) {
        send({ type: "CANCEL" });
        useCanvasTools.getState().setActiveTool("SELECT");
        return;
      }

      // Multi-select: never deselect when shift/cmd/ctrl is held.
      if (event.shiftKey || event.metaKey || event.ctrlKey) return;

      // Clicking empty ground deselects everything unless locked
      send({ type: "DESELECT_ALL" });
      deselectAll();
    },
    [state, send, insertNodeCRDT, addNode, deselectAll]
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
