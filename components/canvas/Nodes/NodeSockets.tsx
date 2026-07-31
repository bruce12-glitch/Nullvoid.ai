"use client";

import { useCanvasStore } from "@/stores/useCanvasStore";
import { ThreeEvent } from "@react-three/fiber";
import { useInsertEdgeCRDT } from "@/hooks/useLiveblocksCanvasSync";
import { canvasFSMActor } from "@/hooks/useCanvasFSM";
import { useCanvasTools } from "@/hooks/useCanvasTools";
import type { CanvasEdge } from "@/types/canvas";

interface NodeSocketsProps {
  nodeId: string;
  isVisible: boolean; // Hovered or CONNECTING mode
}

export function NodeSockets({ nodeId, isVisible }: NodeSocketsProps) {
  const { 
    canvasMode, 
    startDrawingEdge, 
    stopDrawingEdge, 
    drawingEdgeSource,
    addEdge
  } = useCanvasStore();

  // Liveblocks CRDT mutation (safe: returns no-op if not inside RoomProvider)
  const insertEdgeCRDT = useInsertEdgeCRDT();

  const showSockets = isVisible || canvasMode === "CONNECTING";

  if (!showSockets) return null;

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (canvasMode !== "CONNECTING") return;
    startDrawingEdge(nodeId);
    
    // Try to capture pointer to keep drawing even if mouse moves off the socket
    if (e.target && "setPointerCapture" in e.target) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (e.target as any).setPointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (canvasMode !== "CONNECTING") return;
    
    if (e.target && "releasePointerCapture" in e.target) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (e.target as any).releasePointerCapture(e.pointerId);
      } catch (err) {}
    }

    // If drawingEdgeSource is set and it's NOT this node, create connection!
    if (drawingEdgeSource && drawingEdgeSource !== nodeId) {
      const edge: CanvasEdge = {
        id: `edge-${Date.now()}`,
        sourceNodeId: drawingEdgeSource,
        targetNodeId: nodeId,
        type: "SYNC_HTTP",
        label: "",
        data: {},
        source: drawingEdgeSource,
        target: nodeId,
      };
      
      insertEdgeCRDT?.(edge);
      addEdge(edge);

      // Complete the connect FSM state and reset the toolbar to SELECT
      canvasFSMActor.send({ type: "COMPLETE_CONNECT" });
      useCanvasTools.getState().setActiveTool("SELECT");
    }
    
    stopDrawingEdge();
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (canvasMode === "CONNECTING") {
      document.body.style.cursor = "crosshair";
    }
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = "auto";
  };

  // Service node is 2x1x2. So sockets at +/- 1.1 on X and Z axes
  const socketPositions: [number, number, number][] = [
    [0, 0.5, -1.1], // North
    [1.1, 0.5, 0],  // East
    [0, 0.5, 1.1],  // South
    [-1.1, 0.5, 0], // West
  ];

  return (
    <group>
      {socketPositions.map((pos, i) => (
        <group key={i} position={pos}>
          <mesh
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
          >
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh scale={[1.4, 1.4, 1.4]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshBasicMaterial color="#3b82f6" transparent opacity={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
