import { create } from "zustand";
import type { CanvasNode, CanvasEdge } from "@/types/canvas";

interface CanvasSnapshot {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  timestamp: number;
}

interface CanvasHistoryState {
  snapshots: CanvasSnapshot[];
  canUndo: boolean;
  captureSnapshot: (nodes: CanvasNode[], edges: CanvasEdge[]) => void;
  popSnapshot: () => CanvasSnapshot | null;
  clearHistory: () => void;
}

const MAX_SNAPSHOTS = 20;

export const useCanvasHistory = create<CanvasHistoryState>((set, get) => ({
  snapshots: [],
  canUndo: false,

  captureSnapshot: (nodes, edges) => {
    const snapshot: CanvasSnapshot = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
      timestamp: Date.now(),
    };
    set((state) => ({
      snapshots: [...state.snapshots.slice(-(MAX_SNAPSHOTS - 1)), snapshot],
      canUndo: true,
    }));
  },

  popSnapshot: () => {
    const { snapshots } = get();
    if (snapshots.length === 0) return null;

    const last = snapshots[snapshots.length - 1];
    set((state) => ({
      snapshots: state.snapshots.slice(0, -1),
      canUndo: state.snapshots.length > 1,
    }));
    return last;
  },

  clearHistory: () => set({ snapshots: [], canUndo: false }),
}));
