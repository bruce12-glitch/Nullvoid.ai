"use client";

import { useCanvasStore } from "@/stores/useCanvasStore";
import { SystemEdge } from "./SystemEdge";
import { TempConnectionEdge } from "./TempConnectionEdge";

export function EdgeLayer() {
  const edges = useCanvasStore((s) => s.edges);

  return (
    <group>
      {edges.map((edge) => (
        <SystemEdge key={edge.id} edge={edge} />
      ))}
      <TempConnectionEdge />
    </group>
  );
}
