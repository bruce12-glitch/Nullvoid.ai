"use client";

import { useEffect, useRef } from "react";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { useCanvasAutosave } from "@/hooks/use-canvas-autosave";
import type { CanvasNode, CanvasEdge } from "@/types/canvas";

/**
 * Loads and autosaves the 3D canvas.
 *
 * The 3D route (`/canvas/[id]`) previously had no persistence at all: nothing
 * ever called `GET/PUT /api/projects/[projectId]/canvas`, so a diagram built
 * there survived only as long as the Liveblocks room stayed warm and was gone
 * after a reload. The 2D editor already did this via `useCanvasAutosave`;
 * this component gives the 3D editor the same guarantee.
 *
 * Renders nothing — it exists purely for its effects.
 */
export function CanvasPersistence({ projectId }: { projectId: string }) {
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const setNodes = useCanvasStore((s) => s.setNodes);
  const setEdges = useCanvasStore((s) => s.setEdges);

  // Debounced PUT of the current graph.
  useCanvasAutosave(projectId, nodes, edges);

  // Hydrate once on mount, and only when the room is genuinely empty so we
  // never clobber state that Liveblocks has already synced from a peer.
  const didLoadRef = useRef(false);
  useEffect(() => {
    if (didLoadRef.current) return;
    didLoadRef.current = true;

    const { nodes: n, edges: e } = useCanvasStore.getState();
    if (n.length > 0 || e.length > 0) return;

    let cancelled = false;

    fetch(`/api/projects/${projectId}/canvas`)
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: { canvas: { nodes?: CanvasNode[]; edges?: CanvasEdge[] } | null } | null) => {
        if (cancelled || !payload?.canvas) return;

        // Re-check: a collaborator's state may have arrived while we fetched.
        const { nodes: cur, edges: curE } = useCanvasStore.getState();
        if (cur.length > 0 || curE.length > 0) return;

        if (payload.canvas.nodes?.length) setNodes(payload.canvas.nodes);
        if (payload.canvas.edges?.length) setEdges(payload.canvas.edges);
      })
      .catch(() => {
        /* offline or not yet saved — start from an empty canvas */
      });

    return () => {
      cancelled = true;
    };
  }, [projectId, setNodes, setEdges]);

  return null;
}
