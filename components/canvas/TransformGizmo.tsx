"use client";

import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { TransformControls } from "@react-three/drei";
import * as THREE from "three";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { useCanvasTools } from "@/hooks/useCanvasTools";
import { useCanvasPreferences } from "@/hooks/useCanvasPreferences";
import { useDisposal } from "@/hooks/useDisposal";
import { useCanvasFSM } from "@/hooks/useCanvasFSM";
import { useUpdateNodeCRDT } from "@/hooks/useLiveblocksCanvasSync";
import type { Position3D } from "@/types/canvas";

export function TransformGizmo() {
  const selectedNodeIds = useCanvasStore((s) => s.selectedNodeIds);
  const nodes = useCanvasStore((s) => s.nodes);
  const updateSelectedNodeProperty = useCanvasStore((s) => s.updateSelectedNodeProperty);
  const updateNodePosition = useCanvasStore((s) => s.updateNodePosition);
  const updateNodeCRDT = useUpdateNodeCRDT();
  const gizmoMode = useCanvasTools((s) => s.gizmoMode);
  const showGrid = useCanvasPreferences((s) => s.showGrid);
  const { send } = useCanvasFSM();
  const { controls } = useThree();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformRef = useRef<any>(null);
  const meshRef = useRef<THREE.Group>(null);
  const lastBroadcast = useRef(0);

  // Multi-select drag state
  const startPositions = useRef<Map<string, Position3D>>(new Map());
  const primaryStart = useRef<Position3D | null>(null);

  useDisposal(meshRef);

  const primaryNode = nodes.find(n => n.id === selectedNodeIds[0]);

  // Sync the proxy object with the store's node data, but ONLY when not actively dragging the gizmo.
  // This allows the Inspector Panel to drive the gizmo position.
  useEffect(() => {
    if (meshRef.current && primaryNode) {
      if (!transformRef.current?.dragging) {
        meshRef.current.position.set(primaryNode.position.x, primaryNode.position.y, primaryNode.position.z || 0);

        if (primaryNode.rotation) {
          meshRef.current.rotation.set(primaryNode.rotation.x, primaryNode.rotation.y, primaryNode.rotation.z || 0);
        } else {
          meshRef.current.rotation.set(0, 0, 0);
        }

        if (primaryNode.scale) {
          meshRef.current.scale.set(primaryNode.scale.x, primaryNode.scale.y, primaryNode.scale.z || 1);
        } else {
          meshRef.current.scale.set(1, 1, 1);
        }
      }
    }
  }, [primaryNode]);

  if (selectedNodeIds.length === 0 || !primaryNode) return null;

  const handleMouseDown = () => {
    // Record start positions of every selected node for rigid-group translation.
    startPositions.current.clear();
    for (const id of selectedNodeIds) {
      const n = nodes.find((nn) => nn.id === id);
      if (n) startPositions.current.set(id, n.position);
    }
    primaryStart.current = primaryNode?.position ?? null;
    send({ type: "START_TRANSFORM" });
  };

  const handleMouseUp = () => {
    send({ type: "END_TRANSFORM" });
    if (meshRef.current && primaryNode) {
      const rot = meshRef.current.rotation;
      const scl = meshRef.current.scale;
      // Guarantee final convergence broadcast for every selected node
      const current = useCanvasStore.getState();
      for (const id of selectedNodeIds) {
        const n = current.nodes.find((nn) => nn.id === id);
        if (!n) continue;
        updateNodeCRDT(id, {
          position: n.position,
          rotation: n.rotation ?? { x: rot.x, y: rot.y, z: rot.z },
          scale: n.scale ?? { x: scl.x, y: scl.y, z: scl.z },
        });
      }
    }
    lastBroadcast.current = 0;
  };

  const handleChange = () => {
    // Sync changes from the gizmo back to the store
    if (transformRef.current?.dragging && meshRef.current && primaryNode) {
      const pos = meshRef.current.position;
      // Spatial constraint: prevent sinking below ground
      if (pos.y < 0) pos.y = 0;
      const rot = meshRef.current.rotation;
      const scl = meshRef.current.scale;

      if (selectedNodeIds.length > 1 && primaryStart.current) {
        // Multi-select: translate the whole group using per-node deltas so
        // nodes keep their relative offsets instead of stacking on the primary.
        const dx = pos.x - primaryStart.current.x;
        const dy = pos.y - primaryStart.current.y;
        const dz = pos.z - (primaryStart.current.z || 0);

        for (const id of selectedNodeIds) {
          const start = startPositions.current.get(id);
          if (!start) continue;
          const next = {
            x: start.x + dx,
            y: Math.max(0, start.y + dy),
            z: (start.z || 0) + dz,
          };
          updateNodePosition(id, next);
        }
      } else {
        // Single selection: optimistic local update (0ms latency)
        updateSelectedNodeProperty("position", { x: pos.x, y: pos.y, z: pos.z });
        updateSelectedNodeProperty("rotation", { x: rot.x, y: rot.y, z: rot.z });
        updateSelectedNodeProperty("scale", { x: scl.x, y: scl.y, z: scl.z });
      }

      // Throttled Remote Sync (~30ms intervals) — always read fresh store state
      const now = Date.now();
      if (now - lastBroadcast.current > 30) {
        const current = useCanvasStore.getState();
        for (const id of selectedNodeIds) {
          const n = current.nodes.find((nn) => nn.id === id);
          if (!n) continue;
          updateNodeCRDT(id, {
            position: n.position,
            rotation: n.rotation ?? { x: rot.x, y: rot.y, z: rot.z },
            scale: n.scale ?? { x: scl.x, y: scl.y, z: scl.z },
          });
        }
        lastBroadcast.current = now;
      }
    }
  };

  return (
    <>
      <TransformControls
        ref={transformRef}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        object={meshRef as any}
        mode={gizmoMode}
        translationSnap={showGrid ? 0.5 : null}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onChange={handleChange}
      />
      {/* Invisible proxy group for the gizmo to attach to */}
      <group ref={meshRef} visible={false} />
    </>
  );
}
