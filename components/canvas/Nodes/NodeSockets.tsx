"use client";

import { useCanvasStore } from "@/stores/useCanvasStore";
import { ThreeEvent } from "@react-three/fiber";
import { useInsertEdgeCRDT } from "@/hooks/useLiveblocksCanvasSync";

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

  // Try to use Liveblocks insert mutation if we're in a room context
  let insertEdgeCRDT: ReturnType<typeof useInsertEdgeCRDT> | undefined;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    insertEdgeCRDT = useInsertEdgeCRDT();
  } catch (e) {
    // Fallback if not inside RoomProvider
  }

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const edge = {
        id: `edge-${Date.now()}`,
        sourceNodeId: drawingEdgeSource,
        targetNodeId: nodeId,
        type: "SYNC_HTTP", // Default type
        data: {},
        source: drawingEdgeSource, // XYFlow compatibility
        target: nodeId, // XYFlow compatibility
      } as any;
      
      insertEdgeCRDT?.(edge);
      addEdge(edge);
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
        <mesh 
          key={i} 
          position={pos} 
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshBasicMaterial color="#ffffff" />
          {/* subtle glow */}
          <mesh scale={[1.4, 1.4, 1.4]}>
             <sphereGeometry args={[0.15, 16, 16]} />
             <meshBasicMaterial color="#3b82f6" transparent opacity={0.4} />
          </mesh>
        </mesh>
      ))}
    </group>
  );
}
