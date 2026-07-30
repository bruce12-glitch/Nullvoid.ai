import { create } from "zustand";

export type ActiveTool = 
  | "SELECT" 
  | "PAN" 
  | "ADD_NODE" 
  | "CONNECT" 
  | "GIZMO_TRANSLATE" 
  | "GIZMO_ROTATE" 
  | "GIZMO_SCALE" 
  | "AI_PROMPT";

export type GizmoMode = "translate" | "rotate" | "scale";

interface CanvasToolsState {
  activeTool: ActiveTool;
  gizmoMode: GizmoMode;
  
  setActiveTool: (tool: ActiveTool) => void;
  setGizmoMode: (mode: GizmoMode) => void;
}

export const useCanvasTools = create<CanvasToolsState>((set) => ({
  activeTool: "SELECT",
  gizmoMode: "translate",
  
  setActiveTool: (tool) => set((state) => {
    // If the selected tool is a gizmo tool, automatically sync gizmoMode
    if (tool === "GIZMO_TRANSLATE") return { activeTool: tool, gizmoMode: "translate" };
    if (tool === "GIZMO_ROTATE") return { activeTool: tool, gizmoMode: "rotate" };
    if (tool === "GIZMO_SCALE") return { activeTool: tool, gizmoMode: "scale" };
    return { activeTool: tool };
  }),
  
  setGizmoMode: (mode) => set({ gizmoMode: mode }),
}));
