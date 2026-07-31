"use client";

import { useEffect } from "react";
import { useStorage, useMutation } from "@liveblocks/react";
import { LiveObject } from "@liveblocks/client";
import { useCanvasStore } from "@/stores/useCanvasStore";
import type { CanvasNode, CanvasEdge } from "@/types/canvas";

/**
 * Hook to bind Liveblocks CRDT storage to local Zustand store.
 * Mount this exactly once (e.g. in Scene.tsx).
 */
export function useLiveblocksDownstreamSync() {
  const liveNodes = useStorage((root) => root.nodes);
  const liveEdges = useStorage((root) => root.edges);

  const setNodes = useCanvasStore((s) => s.setNodes);
  const setEdges = useCanvasStore((s) => s.setEdges);

  // Liveblocks 3.18: useStorage returns plain JSON objects for LiveMap values
  // (not Map instances). Convert via Object.values() to hydrate the local store.
  useEffect(() => {
    if (!liveNodes) return;
    const nodesArray = Object.values(liveNodes) as CanvasNode[];
    setNodes(nodesArray);
  }, [liveNodes, setNodes]);

  // When remote edges change, hydrate Zustand
  useEffect(() => {
    if (!liveEdges) return;
    const edgesArray = Object.values(liveEdges) as CanvasEdge[];
    setEdges(edgesArray);
  }, [liveEdges, setEdges]);
}

/**
 * CRDT Mutations
 *
 * These hooks MUST be used inside a <RoomProvider>. They call useMutation
 * unconditionally to satisfy the Rules of Hooks.
 */

export function useInsertNodeCRDT() {
  return useMutation(({ storage }, node: CanvasNode) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    storage.get("nodes").set(node.id, new LiveObject(node as any));
  }, []);
}

export function useUpdateNodeCRDT() {
  return useMutation(({ storage }, nodeId: string, updates: Partial<CanvasNode>) => {
    const liveNode = storage.get("nodes").get(nodeId);
    if (liveNode) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      liveNode.update(updates as any);
    }
  }, []);
}

export function useDeleteNodesCRDT() {
  return useMutation(({ storage }, nodeIds: string[]) => {
    const nodesMap = storage.get("nodes");
    const edgesMap = storage.get("edges");

    // Delete nodes
    nodeIds.forEach((id) => {
      nodesMap.delete(id);
    });

    // Delete associated edges
    const edgesToDelete: string[] = [];
    edgesMap.forEach((edge, edgeId) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const e = (edge as any).toObject() as CanvasEdge;
      if (nodeIds.includes(e.sourceNodeId) || nodeIds.includes(e.targetNodeId)) {
        edgesToDelete.push(edgeId);
      }
    });

    edgesToDelete.forEach((edgeId) => {
      edgesMap.delete(edgeId);
    });
  }, []);
}

export function useDeleteEdgesCRDT() {
  return useMutation(({ storage }, edgeIds: string[]) => {
    const edgesMap = storage.get("edges");
    edgeIds.forEach((id) => {
      edgesMap.delete(id);
    });
  }, []);
}

export function useInsertEdgeCRDT() {
  return useMutation(({ storage }, edge: CanvasEdge) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    storage.get("edges").set(edge.id, new LiveObject(edge as any));
  }, []);
}

export function useUpdateEdgeCRDT() {
  return useMutation(({ storage }, edgeId: string, updates: Partial<CanvasEdge>) => {
    const edgesMap = storage.get("edges");
    const liveEdge = edgesMap.get(edgeId);
    if (liveEdge) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      liveEdge.update(updates as any);
    }
  }, []);
}

/**
 * Replaces the entire CRDT canvas (nodes + edges) with the given arrays.
 * Used by undo/redo so history state is fully collaborative.
 */
export function useReplaceStorageCRDT() {
  return useMutation(({ storage }, nodes: CanvasNode[], edges: CanvasEdge[]) => {
    const nodesMap = storage.get("nodes");
    const edgesMap = storage.get("edges");

    nodesMap.forEach((_, id) => nodesMap.delete(id));
    nodes.forEach((node) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      nodesMap.set(node.id, new LiveObject(node as any));
    });

    edgesMap.forEach((_, id) => edgesMap.delete(id));
    edges.forEach((edge) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      edgesMap.set(edge.id, new LiveObject(edge as any));
    });
  }, []);
}
