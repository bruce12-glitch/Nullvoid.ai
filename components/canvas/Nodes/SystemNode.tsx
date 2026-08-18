"use client";

import { useRef, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { canvasFSMActor } from "@/hooks/useCanvasFSM";
import { useOthers } from "@/lib/collab/suspense";
import type { CanvasNode } from "@/types/canvas";
import { ServiceNode } from "./ServiceNode";
import { DatabaseNode } from "./DatabaseNode";
import { GatewayNode } from "./GatewayNode";
import { RobotNode } from "./RobotNode";
import { NodeStatusBadge } from "./NodeStatusBadge";
import { NodeSockets } from "./NodeSockets";
import { useDisposal } from "@/hooks/useDisposal";
import { ThreeEvent } from "@react-three/fiber";
import { AnimatedNodeWrapper } from "./AnimatedNodeWrapper";

interface SystemNodeProps {
  node: CanvasNode;
}

export function SystemNode({ node }: SystemNodeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const selectionRef = useRef<THREE.Mesh>(null);
  const selectSingleNode = useCanvasStore((s) => s.selectSingleNode);
  const toggleNodeSelection = useCanvasStore((s) => s.toggleNodeSelection);
  const hoverNode = useCanvasStore((s) => s.hoverNode);
  const selectedNodeIds = useCanvasStore((s) => s.selectedNodeIds);
  const hoveredNodeId = useCanvasStore((s) => s.hoveredNodeId);
  
  const others = useOthers();
  const remoteEditor = others.find((other) => other.presence.selectedNodeId === node.id);

  const isSelected = selectedNodeIds.includes(node.id);
  const isHovered = hoveredNodeId === node.id;

  const scaleRef = useRef(1);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    
    // Smooth hover scale
    const targetScale = isHovered ? 1.08 : 1.0;
    scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, targetScale, delta * 10);
    if (groupRef.current) {
      groupRef.current.scale.set(scaleRef.current, scaleRef.current, scaleRef.current);
    }

    // Animated selection wireframe
    if (selectionRef.current) {
      selectionRef.current.rotation.y = t * 0.8;
      selectionRef.current.rotation.x = Math.sin(t * 0.5) * 0.15;
      const pulse = 0.4 + Math.sin(t * 3) * 0.2;
      const mat = selectionRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = pulse;
    }
  });

  useDisposal(groupRef);

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = "pointer";
    hoverNode(node.id);
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = "auto";
    hoverNode(null);
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.shiftKey || e.metaKey || e.ctrlKey) {
      toggleNodeSelection(node.id);
    } else {
      selectSingleNode(node.id);
    }
    canvasFSMActor.send({ type: "SELECT_NODE" });
  };

  // Prevent pointerdown from reaching the ground plane so empty-space
  // deselection never fires when clicking on a node (breaks shift multi-select).
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
  };

  return (
    <AnimatedNodeWrapper targetPosition={[node.position.x, node.position.y, node.position.z || 0]}>
      <group
        ref={groupRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
      >
        <NodeStatusBadge label={node.label} status={node.status} />

        {/* Connection Sockets */}
        <NodeSockets nodeId={node.id} isVisible={isHovered || isSelected} />

        <Suspense
          fallback={
            <mesh position={[0, 0.5, 0]}>
              <boxGeometry args={[1.6, 1.6, 1.6]} />
              <meshStandardMaterial color={node.color || "#6366f1"} roughness={0.3} metalness={0.6} />
            </mesh>
          }
        >
          {/* Render Node Shape based on Type */}
          {node.type === "SERVICE" && <ServiceNode color={node.color} />}
          {node.type === "DATABASE" && <DatabaseNode color={node.color} />}
          {node.type === "API_GATEWAY" && <GatewayNode color={node.color} />}
          {node.type === "ROBOT_UNIT" && <RobotNode scale={0.05} />}
          
          {/* Fallback for generic/legacy nodes */}
          {["CUSTOM_3D", "MESSAGE_QUEUE", "STORAGE_BUCKET", "AUTH_PROVIDER", "canvasNode"].includes(node.type) && (
            <ServiceNode color={node.color} />
          )}
        </Suspense>

        {/* Selection Highlight - Animated Rotating Wireframe */}
        {isSelected && (
          <mesh ref={selectionRef} position={[0, 0.5, 0]}>
            <boxGeometry args={[2.6, 2.6, 2.6]} />
            <meshBasicMaterial 
              color="#00c8d4" 
              wireframe 
              transparent 
              opacity={0.5}
              toneMapped={false}
            />
          </mesh>
        )}

        {/* Hover Glow Aura */}
        {isHovered && !isSelected && (
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[2.5, 2.5, 2.5]} />
            <meshBasicMaterial 
              color="#6457f9" 
              wireframe 
              transparent 
              opacity={0.15}
              toneMapped={false}
            />
          </mesh>
        )}

        {/* Remote Collaborator Highlight */}
        {remoteEditor && (
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[2.8, 2.8, 2.8]} />
            <meshBasicMaterial 
              color={remoteEditor.info?.color || "#6457f9"} 
              wireframe 
              transparent 
              opacity={0.5}
              toneMapped={false}
            />
          </mesh>
        )}
      </group>
    </AnimatedNodeWrapper>
  );
}
