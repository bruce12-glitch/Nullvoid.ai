import { useEffect, useState } from "react";
import { createActor } from "xstate";
import { canvasMachine } from "@/machines/canvasMachine";
import { useCanvasStore } from "@/stores/useCanvasStore";
import type { CanvasMode } from "@/stores/useCanvasStore";

// Global singleton actor for the canvas FSM
export const canvasFSMActor = createActor(canvasMachine);

// Start immediately on client-side
if (typeof window !== "undefined") {
  canvasFSMActor.start();
  
  // Global Keyboard Guards (Escape to cancel)
  window.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      canvasFSMActor.send({ type: "CANCEL" });
    }
  });
}

export function useCanvasFSM() {
  const [state, setState] = useState(canvasFSMActor.getSnapshot());
  const setCanvasMode = useCanvasStore((s) => s.setCanvasMode);

  // Sync XState machine state to Zustand canvasMode
  useEffect(() => {
    const sub = canvasFSMActor.subscribe((newState) => {
      setState(newState);
      
      let newMode: CanvasMode = "IDLE";
      
      if (newState.matches("idle")) newMode = "IDLE";
      else if (newState.matches("nodeSelected")) newMode = "SELECTING";
      else if (newState.matches("transforming")) newMode = "SELECTING";
      else if (newState.matches("connecting")) newMode = "CONNECTING";
      else if (newState.matches("placingNode")) newMode = "PLACING_NODE";
      else if (newState.matches("aiGenerating")) newMode = "IDLE"; // Locked state

      setCanvasMode(newMode);
    });
    return () => sub.unsubscribe();
  }, [setCanvasMode]);

  return { state, send: canvasFSMActor.send.bind(canvasFSMActor) };
}
