"use client";

import { Suspense } from "react";
import { Grid } from "@react-three/drei";
import { StageEnvironment } from "./Environment";
import { CanvasLoader } from "./CanvasLoader";
import { RobotNode } from "./Nodes/RobotNode";
import { useCanvasPreferences } from "@/hooks/useCanvasPreferences";
import { CanvasContainer } from "./CanvasContainer";
import { Camera } from "./Camera";
import { BaseCanvas } from "./BaseCanvas";
import { CanvasPerformance } from "./CanvasPerformance";
import { InstancedNodes } from "./Performance/InstancedNodes";
import { TransformGizmo } from "./TransformGizmo";
import { EdgeLayer } from "./Edges/EdgeLayer";
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
  const { clearSelection } = useCanvasStore();
  
  // Bind downstream Liveblocks CRDT mutations -> local Zustand store
  useLiveblocksDownstreamSync();

  const handlePointerMissed = () => {
    if (state.matches("transforming") || state.matches("aiGenerating")) return;
    send({ type: "DESELECT_ALL" });
    clearSelection();
  };

  return (
    <CanvasContainer>
      <Camera 
        // We'd ideally pass disabled state to Camera if it manages OrbitControls
      />
      <StageEnvironment />

      {/* Invisible interaction ground plane for raycasting & deselection */}
      <BaseCanvas />

      {/* Instanced background nodes for high FPS */}
      <InstancedNodes />

      {/* 3D Transform Gizmo */}
      <TransformGizmo />

      {/* Edges & Connections */}
      <EdgeLayer />

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
          cellColor="#27272a" 
          sectionColor="#3f3f46" 
          sectionSize={5}
          position={[0, -0.01, 0]} 
        />
      )}

      <Suspense fallback={<CanvasLoader />}>
        <RobotNode />
      </Suspense>
    </CanvasContainer>
  );
}
