"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { canvasFSMActor } from "@/hooks/useCanvasFSM";
import { useOthers } from "@liveblocks/react/suspense";
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
  const { selectSingleNode, toggleNodeSelection, hoverNode, selectedNodeIds, hoveredNodeId } = useCanvasStore();
  
  const others = useOthers();
  const remoteEditor = others.find((other) => other.presence.selectedNodeId === node.id);

  const isSelected = selectedNodeIds.includes(node.id);
  const isHovered = hoveredNodeId === node.id;

  const [scale, setScale] = useState(1);

  // Smooth hover scaling
  useFrame((state, delta) => {
    const targetScale = isHovered ? 1.05 : 1.0;
    setScale((prev) => THREE.MathUtils.lerp(prev, targetScale, delta * 10));
    if (groupRef.current) {
      groupRef.current.scale.set(scale, scale, scale);
    }
  });

  // Automated VRAM memory disposal
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

  return (
    <AnimatedNodeWrapper targetPosition={[node.position.x, node.position.y, node.position.z || 0]}>
      <group
        ref={groupRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <NodeStatusBadge label={node.label} status={node.status} />

      {/* Connection Sockets */}
      <NodeSockets nodeId={node.id} isVisible={isHovered || isSelected} />

      {/* Render Node Shape based on Type */}
      {node.type === "SERVICE" && <ServiceNode color={node.color} />}
      {node.type === "DATABASE" && <DatabaseNode color={node.color} />}
      {node.type === "API_GATEWAY" && <GatewayNode color={node.color} />}
      {node.type === "ROBOT_UNIT" && <RobotNode />}
      
      {/* Fallback for generic/legacy nodes */}
      {["CUSTOM_3D", "MESSAGE_QUEUE", "STORAGE_BUCKET", "AUTH_PROVIDER", "canvasNode"].includes(node.type) && (
        <ServiceNode color={node.color} />
      )}

      {/* Selection Highlight - Wireframe Bounding Box */}
      {isSelected && (
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[2.5, 2.5, 2.5]} />
          <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.6} />
        </mesh>
      )}

      {/* Remote Collaborator Highlight */}
      {remoteEditor && (
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[2.7, 2.7, 2.7]} />
          <meshBasicMaterial color={remoteEditor.info?.color || "#6457f9"} wireframe transparent opacity={0.6} />
        </mesh>
      )}
    </group>
    </AnimatedNodeWrapper>
  );
}
