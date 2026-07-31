import { useEffect, useState } from "react";
import { createActor, type Actor } from "xstate";
import { canvasMachine } from "@/machines/canvasMachine";
import { useCanvasStore } from "@/stores/useCanvasStore";
import type { CanvasMode } from "@/stores/useCanvasStore";

// Lazily create and cache the singleton actor (only on client)
let actorInstance: ReturnType<typeof createActor> | null = null;

function getCanvasActor(): ReturnType<typeof createActor> {
  if (typeof window === "undefined") {
    // Return a no-op actor proxy on the server
    return {
      getSnapshot: () => ({ value: "idle", context: {} }),
      send: () => {},
      subscribe: () => ({ unsubscribe: () => {} }),
      start: () => {},
      stop: () => {},
      status: "stopped" as const,
    } as unknown as ReturnType<typeof createActor>;
  }
  if (!actorInstance) {
    actorInstance = createActor(canvasMachine);
    actorInstance.start();
  }
  return actorInstance;
}

// Global accessor for the singleton actor
export const canvasFSMActor = new Proxy({} as ReturnType<typeof createActor>, {
  get(_, prop) {
    return Reflect.get(getCanvasActor(), prop);
  },
});

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
