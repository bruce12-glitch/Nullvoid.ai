"use client";

import { Grid } from "@react-three/drei";
import { StageEnvironment } from "./Environment";
import { SystemNode } from "./Nodes/SystemNode";
import { useCanvasPreferences } from "@/hooks/useCanvasPreferences";
import { CanvasContainer } from "./CanvasContainer";
import { Camera } from "./Camera";
import { BaseCanvas } from "./BaseCanvas";
import { CanvasPerformance } from "./CanvasPerformance";
import { InstancedNodes } from "./Performance/InstancedNodes";
import { TransformGizmo } from "./TransformGizmo";
import { EdgeLayer } from "./Edges/EdgeLayer";
import { TempConnectionEdge } from "./Edges/TempConnectionEdge";
import { MemoryAuditor } from "./MemoryAuditor";
import { FSMDebugger } from "./FSMDebugger";
import { CanvasTelemetry } from "./CanvasTelemetry";
import { MultiplayerCursors } from "./Presence/MultiplayerCursors";
import { useCanvasFSM } from "@/hooks/useCanvasFSM";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { useLiveblocksDownstreamSync } from "@/hooks/useLiveblocksCanvasSync";

export function Scene() {
  const { showGrid } = useCanvasPreferences();
  const { state, send } = useCanvasFSM();
  const nodes = useCanvasStore((s) => s.nodes);
  const clearSelection = useCanvasStore((s) => s.clearSelection);
  
  // Bind downstream Liveblocks CRDT mutations -> local Zustand store
  useLiveblocksDownstreamSync();

  const handlePointerMissed = () => {
    if (state.matches("transforming") || state.matches("aiGenerating")) return;
    send({ type: "DESELECT_ALL" });
    clearSelection();
  };

  return (
    <CanvasContainer>
      <Camera />
      <StageEnvironment />

      {/* Invisible interaction ground plane for raycasting & deselection */}
      <BaseCanvas />

      {/* Architecture Nodes from store */}
      {nodes.map((node) => (
        <SystemNode key={node.id} node={node} />
      ))}

      {/* Instanced background nodes for high FPS */}
      <InstancedNodes />

      {/* 3D Transform Gizmo */}
      <TransformGizmo />

      {/* Edges & Connections */}
      <EdgeLayer />
      <TempConnectionEdge />

      {/* Real-time Presence Cursors */}
      <MultiplayerCursors />

      {/* Performance & Memory diagnostics overlays */}
      <CanvasPerformance />
      <MemoryAuditor />
      <FSMDebugger />
      <CanvasTelemetry />

      {/* Infinite Ground Grid */}
      {showGrid && (
        <Grid 
          infiniteGrid 
          fadeDistance={30} 
          cellColor="#00c8d4" 
          cellThickness={0.5}
          cellSize={1}
          sectionColor="#6457f9" 
          sectionThickness={1}
          sectionSize={5}
          fadeStrength={1.5}
          position={[0, -0.01, 0]} 
        />
      )}
    </CanvasContainer>
  );
}
