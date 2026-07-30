"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { QuadraticBezierLine } from "@react-three/drei";
import { useCanvasStore } from "@/stores/useCanvasStore";

export function TempConnectionEdge() {
  const { drawingEdgeSource, cursor3D, nodes } = useCanvasStore();

  const sourceNode = useMemo(() => {
    if (!drawingEdgeSource) return null;
    return nodes.find(n => n.id === drawingEdgeSource);
  }, [drawingEdgeSource, nodes]);

  const { start, end, mid } = useMemo(() => {
    if (!sourceNode) {
      return { start: new THREE.Vector3(), end: new THREE.Vector3(), mid: new THREE.Vector3() };
    }
    
    const sPos = sourceNode.position;
    const start = new THREE.Vector3(sPos.x, sPos.y + 0.5, sPos.z || 0);
    const end = new THREE.Vector3(cursor3D.x, cursor3D.y, cursor3D.z || 0);

    const distance = start.distanceTo(end);
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    mid.y = Math.max(1.5, Math.min(distance * 0.4, 10.0));

    return { start, end, mid };
  }, [sourceNode, cursor3D]);

  if (!drawingEdgeSource || !sourceNode) return null;

  return (
    <QuadraticBezierLine
      start={start}
      end={end}
      mid={mid}
      color="#3b82f6"
      lineWidth={2}
      dashed
      dashScale={50}
      dashSize={1}
      gapSize={0.5}
      transparent
      opacity={0.6}
    />
  );
}
