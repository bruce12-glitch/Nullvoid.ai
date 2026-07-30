import { useCanvasFSM } from "@/hooks/useCanvasFSM";
import { Html } from "@react-three/drei";

export function FSMDebugger() {
  const { state } = useCanvasFSM();

  if (process.env.NODE_ENV !== "development") return null;

  return (
    <Html position={[0, 0, 0]} zIndexRange={[100, 0]} className="pointer-events-none select-none">
      <div className="fixed top-24 right-4 z-30 p-4 w-64 bg-card/60 backdrop-blur-md border border-border/40 rounded-xl shadow-xl text-xs text-muted-foreground pointer-events-none font-mono">
        <h3 className="text-foreground font-bold mb-3 border-b border-border/40 pb-2">FSM Debugger</h3>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span>Active State:</span>
            <span className="font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
              {state.value as string}
            </span>
          </div>
        </div>
      </div>
    </Html>
  );
}
