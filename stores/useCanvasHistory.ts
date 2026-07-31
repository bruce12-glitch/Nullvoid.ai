import { create } from "zustand";
import type { CanvasNode, CanvasEdge } from "@/types/canvas";

interface CanvasSnapshot {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  timestamp: number;
}

interface CanvasHistoryState {
  undoStack: CanvasSnapshot[];
  redoStack: CanvasSnapshot[];
  canUndo: boolean;
  canRedo: boolean;
  captureSnapshot: (nodes: CanvasNode[], edges: CanvasEdge[]) => void;
  undo: (nodes: CanvasNode[], edges: CanvasEdge[]) => { nodes: CanvasNode[]; edges: CanvasEdge[] } | null;
  redo: (nodes: CanvasNode[], edges: CanvasEdge[]) => { nodes: CanvasNode[]; edges: CanvasEdge[] } | null;
  clearHistory: () => void;
}

const MAX_SNAPSHOTS = 20;

// Collapse rapid mutations (drags, AI patch batches, inspector keystrokes)
// into a single history entry so undo steps feel natural.
const CAPTURE_DEBOUNCE_MS = 150;
let lastCaptureAt = 0;

export const useCanvasHistory = create<CanvasHistoryState>((set, get) => ({
  undoStack: [],
  redoStack: [],
  canUndo: false,
  canRedo: false,

  captureSnapshot: (nodes, edges) => {
    const now = Date.now();
    if (now - lastCaptureAt < CAPTURE_DEBOUNCE_MS) return;
    lastCaptureAt = now;

    const snapshot: CanvasSnapshot = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
      timestamp: Date.now(),
    };
    set((state) => ({
      undoStack: [...state.undoStack.slice(-(MAX_SNAPSHOTS - 1)), snapshot],
      redoStack: [],
      canUndo: true,
      canRedo: false,
    }));
  },

  undo: (currentNodes, currentEdges) => {
    const { undoStack } = get();
    if (undoStack.length === 0) return null;

    const currentSnapshot: CanvasSnapshot = {
      nodes: JSON.parse(JSON.stringify(currentNodes)),
      edges: JSON.parse(JSON.stringify(currentEdges)),
      timestamp: Date.now(),
    };

    const previous = undoStack[undoStack.length - 1];
    set((state) => ({
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, currentSnapshot],
      canUndo: state.undoStack.length > 1,
      canRedo: true,
    }));

    return { nodes: previous.nodes, edges: previous.edges };
  },

  redo: (currentNodes, currentEdges) => {
    const { redoStack } = get();
    if (redoStack.length === 0) return null;

    const currentSnapshot: CanvasSnapshot = {
      nodes: JSON.parse(JSON.stringify(currentNodes)),
      edges: JSON.parse(JSON.stringify(currentEdges)),
      timestamp: Date.now(),
    };

    const next = redoStack[redoStack.length - 1];
    set((state) => ({
      redoStack: state.redoStack.slice(0, -1),
      undoStack: [...state.undoStack, currentSnapshot],
      canUndo: true,
      canRedo: state.redoStack.length > 1,
    }));

    return { nodes: next.nodes, edges: next.edges };
  },

  clearHistory: () => set({ undoStack: [], redoStack: [], canUndo: false, canRedo: false }),
}));
