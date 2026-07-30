"use client";

import { useEffect, useRef } from "react";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { useUpdateMyPresence } from "@liveblocks/react/suspense";
import { canvasFSMActor } from "@/hooks/useCanvasFSM";

export function useSpatialPresence() {
  const updateMyPresence = useUpdateMyPresence();
  
  const cursor3D = useCanvasStore((s) => s.cursor3D);
  const selectedNodeIds = useCanvasStore((s) => s.selectedNodeIds);
  const canvasMode = useCanvasStore((s) => s.canvasMode);
  
  const lastUpdate = useRef(0);

  // Broadcast 3D Cursor position with throttling
  useEffect(() => {
    const now = Date.now();
    // Throttle to roughly ~30 FPS (33ms) to avoid flooding WebSocket
    if (now - lastUpdate.current > 30) {
      updateMyPresence({ 
        cursor: cursor3D ? { x: cursor3D.x, y: cursor3D.y, z: cursor3D.z } : null 
      });
      lastUpdate.current = now;
    }
  }, [cursor3D, updateMyPresence]);

  // Broadcast current primary selection
  useEffect(() => {
    updateMyPresence({
      selectedNodeId: selectedNodeIds.length > 0 ? selectedNodeIds[0] : null,
    });
  }, [selectedNodeIds, updateMyPresence]);

  // Broadcast AI generating state
  useEffect(() => {
    const sub = canvasFSMActor.subscribe((state) => {
      const isThinking = state.matches("aiGenerating");
      updateMyPresence({
        isThinking,
        thinking: isThinking, // Keep legacy field in sync
      });
    });
    return () => sub.unsubscribe();
  }, [updateMyPresence]);
}
