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

export function TransformGizmo() {
  const { selectedNodeIds, nodes, updateSelectedNodeProperty } = useCanvasStore();
  const updateNodeCRDT = useUpdateNodeCRDT();
  const { gizmoMode } = useCanvasTools();
  const { showGrid } = useCanvasPreferences();
  const { send } = useCanvasFSM();
  const { controls } = useThree();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformRef = useRef<any>(null);
  const meshRef = useRef<THREE.Group>(null);
  const lastBroadcast = useRef(0);
  
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

  return (
    <>
      <TransformControls
        ref={transformRef}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        object={meshRef as any}
        mode={gizmoMode}
        translationSnap={showGrid ? 0.5 : null}
        onMouseDown={() => send({ type: "START_TRANSFORM" })}
        onMouseUp={() => {
          send({ type: "END_TRANSFORM" });
          if (meshRef.current && primaryNode) {
            // Guarantee final convergence broadcast
            const pos = meshRef.current.position;
            const rot = meshRef.current.rotation;
            const scl = meshRef.current.scale;
            updateNodeCRDT(primaryNode.id, {
              position: { x: pos.x, y: pos.y, z: pos.z },
              rotation: { x: rot.x, y: rot.y, z: rot.z },
              scale: { x: scl.x, y: scl.y, z: scl.z },
            });
          }
        }}
        onChange={() => {
          // Sync changes from the gizmo back to the store
          if (transformRef.current?.dragging && meshRef.current && primaryNode) {
             const pos = meshRef.current.position;
             // Spatial constraint: prevent sinking below ground
             if (pos.y < 0) pos.y = 0;
             const rot = meshRef.current.rotation;
             const scl = meshRef.current.scale;

             // 1. Optimistic Local Update (0ms latency)
             updateSelectedNodeProperty("position", { x: pos.x, y: pos.y, z: pos.z });
             updateSelectedNodeProperty("rotation", { x: rot.x, y: rot.y, z: rot.z });
             updateSelectedNodeProperty("scale", { x: scl.x, y: scl.y, z: scl.z });

             // 2. Throttled Remote Sync (~30ms intervals)
             const now = Date.now();
             if (now - lastBroadcast.current > 30) {
               updateNodeCRDT(primaryNode.id, {
                 position: { x: pos.x, y: pos.y, z: pos.z },
                 rotation: { x: rot.x, y: rot.y, z: rot.z },
                 scale: { x: scl.x, y: scl.y, z: scl.z },
               });
               lastBroadcast.current = now;
             }
          }
        }}
      />
      {/* Invisible proxy group for the gizmo to attach to */}
      <group ref={meshRef} visible={false} />
    </>
  );
}
