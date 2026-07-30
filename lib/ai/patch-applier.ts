import { useCanvasStore } from "@/stores/useCanvasStore";
import { useCanvasHistory } from "@/stores/useCanvasHistory";
import type { DeltaPatch } from "@/lib/ai/canvas-differ";
import type { CanvasNode, CanvasEdge } from "@/types/canvas";
import type { Position3D } from "@/types/canvas";

/**
 * Applies an array of validated delta patches to the local Zustand canvas store.
 * Captures a snapshot before applying for revert support.
 */
export function applyDeltaPatches(patches: DeltaPatch[]): void {
  const { nodes, edges, addNode, removeNode, addEdge, setNodes, setEdges } = useCanvasStore.getState();
  const { captureSnapshot } = useCanvasHistory.getState();

  // Capture current state for undo
  captureSnapshot(nodes, edges);

  // Apply each patch in sequence
  for (const patch of patches) {
    switch (patch.op) {
      case "ADD_NODE": {
        const newNode: CanvasNode = {
          id: patch.node.id,
          type: patch.node.type,
          label: patch.node.label,
          position: patch.node.position as Position3D,
          status: patch.node.status ?? "active",
          color: patch.node.color,
          metadata: patch.node.metadata ?? {},
          // Required by XYFlow Node type but not used in 3D
          data: { label: patch.node.label },
          // Mark as freshly added for highlight animation
          // @ts-ignore
          _justAdded: true,
        };
        addNode(newNode);
        break;
      }

      case "REMOVE_NODE": {
        removeNode(patch.nodeId);
        break;
      }

      case "UPDATE_NODE": {
        const { nodes: currentNodes } = useCanvasStore.getState();
        const updated = currentNodes.map((n) =>
          n.id === patch.nodeId ? { ...n, ...patch.updates } : n
        );
        setNodes(updated);
        break;
      }

      case "CONNECT_NODES": {
        const newEdge: CanvasEdge = {
          id: patch.edge.id,
          source: patch.edge.sourceNodeId,
          target: patch.edge.targetNodeId,
          sourceNodeId: patch.edge.sourceNodeId,
          targetNodeId: patch.edge.targetNodeId,
          type: patch.edge.type,
          label: patch.edge.label,
          animated: patch.edge.animated ?? false,
          data: {},
        };
        addEdge(newEdge);
        break;
      }

      case "DISCONNECT_NODES": {
        const { edges: currentEdges } = useCanvasStore.getState();
        setEdges(currentEdges.filter((e) => e.id !== patch.edgeId));
        break;
      }
    }
  }
}

/**
 * Reverts the canvas to the last snapshot.
 * Returns true if revert was possible, false if no history.
 */
export function revertLastPatch(): boolean {
  const { popSnapshot } = useCanvasHistory.getState();
  const { setNodes, setEdges } = useCanvasStore.getState();

  const snapshot = popSnapshot();
  if (!snapshot) return false;

  setNodes(snapshot.nodes);
  setEdges(snapshot.edges);
  return true;
}
