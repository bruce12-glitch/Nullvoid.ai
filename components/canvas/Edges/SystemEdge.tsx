"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
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
  const nodes = useCanvasStore((s) => s.nodes);
  const selectedEdgeIds = useCanvasStore((s) => s.selectedEdgeIds);
  const selectSingleEdge = useCanvasStore((s) => s.selectSingleEdge);
  const toggleEdgeSelection = useCanvasStore((s) => s.toggleEdgeSelection);

  const sourceNode = nodes.find(n => n.id === edge.sourceNodeId);
  const targetNode = nodes.find(n => n.id === edge.targetNodeId);
  
  const groupRef = useRef<THREE.Group>(null);

  useDisposal(groupRef);

  const isSelected = selectedEdgeIds.includes(edge.id);

  const { start, end, mid } = useMemo(() => {
    if (!sourceNode || !targetNode) {
      return { start: new THREE.Vector3(), end: new THREE.Vector3(), mid: new THREE.Vector3() };
    }
    
    const sPos = sourceNode.position;
    const tPos = targetNode.position;

    const start = new THREE.Vector3(sPos.x, sPos.y + 0.5, sPos.z || 0);
    const end = new THREE.Vector3(tPos.x, tPos.y + 0.5, tPos.z || 0);

    const mid = calculateEdgeControlPoint(start, end);

    return { start, end, mid };
  }, [sourceNode, targetNode]);

  if (!sourceNode || !targetNode) return null;

  // Determine colors and styles based on type
  let color = "#f8fafc";
  let glowColor = "#f8fafc";
  let dashed = false;

  switch (edge.type) {
    case "SYNC_HTTP":
      color = "#3b82f6";
      glowColor = "#60a5fa";
      break;
    case "ASYNC_EVENT":
      color = "#f59e0b";
      glowColor = "#fbbf24";
      dashed = true;
      break;
    case "GRPC":
      color = "#8b5cf6";
      glowColor = "#a78bfa";
      break;
    case "WEBSOCKET":
      color = "#22c55e";
      glowColor = "#4ade80";
      break;
    default:
      color = "#f8fafc";
      glowColor = "#ffffff";
  }

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

  // Stop the ground plane from deselecting when an edge is clicked
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
  };

  return (
    <group ref={groupRef}>
      {/* Glow line (wider, transparent) */}
      <QuadraticBezierLine
        start={start}
        end={end}
        mid={mid}
        color={glowColor}
        lineWidth={lineWidth + 3}
        transparent
        opacity={isSelected ? 0.15 : 0.08}
        toneMapped={false}
      />
      
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
        opacity={0.9}
        toneMapped={!isSelected}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
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
        onPointerDown={handlePointerDown}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />
      
      {/* Flow particles */}
      <EdgeFlowParticles start={start} mid={mid} end={end} color={color} />
    </group>
  );
}
