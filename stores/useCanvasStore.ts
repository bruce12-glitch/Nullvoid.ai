import { create } from "zustand";
import type { CanvasNode, CanvasEdge, NodeType, Position3D, Rotation3D } from "@/types/canvas";
import { useCanvasHistory } from "@/stores/useCanvasHistory";

// Record the pre-mutation state so manual edits can be undone.
function snapshotBefore(nodes: CanvasNode[], edges: CanvasEdge[]) {
  useCanvasHistory.getState().captureSnapshot(nodes, edges);
}

export type CanvasMode = "IDLE" | "SELECTING" | "CONNECTING" | "PLACING_NODE";

interface CanvasStoreState {
  // Data
  nodes: CanvasNode[];
  edges: CanvasEdge[];

  // Interaction
  selectedNodeIds: string[];
  selectedEdgeIds: string[];
  hoveredNodeId: string | null;
  cursor3D: Position3D;
  canvasMode: CanvasMode;
  activeNodeTypeToPlace: NodeType | null;
  drawingEdgeSource: string | null;
  cameraFlyTo: Position3D | null;

  // Actions — Data
  setNodes: (nodes: CanvasNode[]) => void;
  setEdges: (edges: CanvasEdge[]) => void;
  addNode: (node: CanvasNode) => void;
  removeNode: (id: string) => void;
  updateNodePosition: (id: string, position: Position3D) => void;
  addEdge: (edge: CanvasEdge) => void;

  // Actions — Selection & Inspector
  selectSingleNode: (id: string) => void;
  toggleNodeSelection: (id: string) => void;
  selectSingleEdge: (id: string) => void;
  toggleEdgeSelection: (id: string) => void;
  clearSelection: () => void;
  selectAllNodes: () => void;
  deleteSelectedNodes: () => void;
  deleteSelectedEdges: () => void;
  updateSelectedNodeProperty: <K extends keyof CanvasNode>(key: K, value: CanvasNode[K]) => void;
  updateSelectedEdgeProperty: <K extends keyof CanvasEdge>(key: K, value: CanvasEdge[K]) => void;

  // Actions — Interaction
  hoverNode: (id: string | null) => void;
  setCursor3D: (position: Position3D) => void;
  setCanvasMode: (mode: CanvasMode) => void;
  setActiveNodeTypeToPlace: (type: NodeType | null) => void;
  startDrawingEdge: (sourceNodeId: string) => void;
  stopDrawingEdge: () => void;
  deselectAll: () => void;
  setCameraFlyTo: (pos: Position3D | null) => void;
}

export const useCanvasStore = create<CanvasStoreState>((set) => ({
  // Initial data
  nodes: [],
  edges: [],

  // Initial interaction state
  selectedNodeIds: [],
  selectedEdgeIds: [],
  hoveredNodeId: null,
  cursor3D: { x: 0, y: 0, z: 0 },
  canvasMode: "IDLE",
  activeNodeTypeToPlace: null,
  drawingEdgeSource: null,
  cameraFlyTo: null,

  // Data actions
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  addNode: (node) =>
    set((state) => {
      snapshotBefore(state.nodes, state.edges);
      return { nodes: [...state.nodes, node] };
    }),

  addEdge: (edge) =>
    set((state) => {
      snapshotBefore(state.nodes, state.edges);
      return { edges: [...state.edges, edge] };
    }),

  removeNode: (id) =>
    set((state) => {
      snapshotBefore(state.nodes, state.edges);
      return {
        nodes: state.nodes.filter((n) => n.id !== id),
        edges: state.edges.filter(
          (e) => e.sourceNodeId !== id && e.targetNodeId !== id
        ),
        selectedNodeIds: state.selectedNodeIds.filter((sId) => sId !== id),
      };
    }),

  updateNodePosition: (id, position) =>
    set((state) => {
      snapshotBefore(state.nodes, state.edges);
      return {
        nodes: state.nodes.map((n) =>
          n.id === id ? { ...n, position } : n
        ),
      };
    }),

  // Selection & Inspector actions
  selectSingleNode: (id) => set({ selectedNodeIds: [id], selectedEdgeIds: [] }),
  
  toggleNodeSelection: (id) => set((state) => {
    const isSelected = state.selectedNodeIds.includes(id);
    return {
      selectedNodeIds: isSelected
        ? state.selectedNodeIds.filter((sId) => sId !== id)
        : [...state.selectedNodeIds, id],
      selectedEdgeIds: [],
    };
  }),

  selectSingleEdge: (id) => set({ selectedEdgeIds: [id], selectedNodeIds: [] }),

  toggleEdgeSelection: (id) => set((state) => {
    const isSelected = state.selectedEdgeIds.includes(id);
    return {
      selectedEdgeIds: isSelected
        ? state.selectedEdgeIds.filter((eId) => eId !== id)
        : [...state.selectedEdgeIds, id],
      selectedNodeIds: [],
    };
  }),

  clearSelection: () => set({ selectedNodeIds: [], selectedEdgeIds: [] }),

  selectAllNodes: () => set((state) => ({
    selectedNodeIds: state.nodes.map((n) => n.id),
    selectedEdgeIds: [],
  })),

  deleteSelectedNodes: () => set((state) => {
    snapshotBefore(state.nodes, state.edges);
    const selectedSet = new Set(state.selectedNodeIds);
    return {
      nodes: state.nodes.filter((n) => !selectedSet.has(n.id)),
      edges: state.edges.filter(
        (e) => !selectedSet.has(e.sourceNodeId) && !selectedSet.has(e.targetNodeId)
      ),
      selectedNodeIds: [],
    };
  }),

  deleteSelectedEdges: () => set((state) => {
    snapshotBefore(state.nodes, state.edges);
    const selectedSet = new Set(state.selectedEdgeIds);
    return {
      edges: state.edges.filter((e) => !selectedSet.has(e.id)),
      selectedEdgeIds: [],
    };
  }),

  updateSelectedNodeProperty: (key, value) => set((state) => {
    snapshotBefore(state.nodes, state.edges);
    return {
      nodes: state.nodes.map((n) =>
        state.selectedNodeIds.includes(n.id) ? { ...n, [key]: value } : n
      ),
    };
  }),

  updateSelectedEdgeProperty: (key, value) => set((state) => {
    snapshotBefore(state.nodes, state.edges);
    return {
      edges: state.edges.map((e) =>
        state.selectedEdgeIds.includes(e.id) ? { ...e, [key]: value } : e
      ),
    };
  }),

  // Interaction actions
  hoverNode: (id) => set({ hoveredNodeId: id }),
  setCursor3D: (position) => set({ cursor3D: position }),
  setCanvasMode: (mode) => set({ canvasMode: mode }),
  setActiveNodeTypeToPlace: (type) => set({ activeNodeTypeToPlace: type }),
  startDrawingEdge: (sourceNodeId) => set({ drawingEdgeSource: sourceNodeId }),
  stopDrawingEdge: () => set({ drawingEdgeSource: null }),
  deselectAll: () => set({ selectedNodeIds: [], selectedEdgeIds: [], hoveredNodeId: null }),
  setCameraFlyTo: (pos) => set({ cameraFlyTo: pos }),
}));
