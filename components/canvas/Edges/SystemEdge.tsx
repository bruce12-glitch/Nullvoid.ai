"use client";

import { useMemo, useEffect, useRef } from "react";
import * as THREE from "three";
import { QuadraticBezierLine } from "@react-three/drei";
import { useCanvasStore } from "@/stores/useCanvasStore";
import type { CanvasEdge } from "@/types/canvas";
import { ThreeEvent } from "@react-three/fiber";
import { EdgeFlowParticles } from "./EdgeFlowParticles";
import { useDisposal } from "@/hooks/useDisposal";
import { calculateEdgeControlPoint } from "@/lib/ai/edge-router";

interface SystemEdgeProps {
  edge: CanvasEdge;
}

export function SystemEdge({ edge }: SystemEdgeProps) {
  const { nodes, selectedEdgeIds, selectSingleEdge, toggleEdgeSelection } = useCanvasStore();

  const sourceNode = nodes.find(n => n.id === edge.sourceNodeId);
  const targetNode = nodes.find(n => n.id === edge.targetNodeId);
  
  const groupRef = useRef<THREE.Group>(null);

  useDisposal(groupRef);

  const isSelected = selectedEdgeIds.includes(edge.id);

  const { start, end, mid } = useMemo(() => {
    if (!sourceNode || !targetNode) {
      return { start: new THREE.Vector3(), end: new THREE.Vector3(), mid: new THREE.Vector3() };
    }
    
    // In 3D, our nodes are at `position.x, position.y, position.z`.
    // We'll attach the line to the top of the nodes (y + 1)
    const sPos = sourceNode.position;
    const tPos = targetNode.position;

    const start = new THREE.Vector3(sPos.x, sPos.y + 0.5, sPos.z || 0);
    const end = new THREE.Vector3(tPos.x, tPos.y + 0.5, tPos.z || 0);

    const mid = calculateEdgeControlPoint(start, end);

    return { start, end, mid };
  }, [sourceNode, targetNode]);

  if (!sourceNode || !targetNode) return null;

  // Determine colors based on type
  let color = "#f8fafc";
  let dashed = false;

  switch (edge.type) {
    case "SYNC_HTTP":
      color = "#3b82f6"; // Blue/Cyan
      break;
    case "ASYNC_EVENT":
      color = "#f59e0b"; // Amber
      dashed = true;
      break;
    case "GRPC":
      color = "#8b5cf6"; // Violet
      break;
    case "WEBSOCKET":
      color = "#22c55e"; // Green
      break;
  }

  // Active Selection overrides color/thickness
  const renderColor = isSelected ? "#ffffff" : color;
  const lineWidth = isSelected ? 4 : 2;

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.shiftKey || e.metaKey || e.ctrlKey) {
      toggleEdgeSelection(edge.id);
    } else {
      selectSingleEdge(edge.id);
    }
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = () => {
    document.body.style.cursor = "auto";
  };

  return (
    <group ref={groupRef}>
      {/* Visible Edge */}
      <QuadraticBezierLine
        start={start}
        end={end}
        mid={mid}
        color={renderColor}
        lineWidth={lineWidth}
        dashed={dashed}
        dashScale={50}
        dashSize={1}
        gapSize={0.5}
        transparent
        opacity={0.8}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />
      
      {/* Invisible thicker line to make hovering/clicking easier */}
      <QuadraticBezierLine
        start={start}
        end={end}
        mid={mid}
        color="#000000"
        lineWidth={15}
        transparent
        opacity={0}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />
      
      {/* Flow particles */}
      <EdgeFlowParticles start={start} mid={mid} end={end} color={color} />
    </group>
  );
}
