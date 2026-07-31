"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { usePerformanceAdaptive } from "@/hooks/usePerformanceAdaptive";
import { useFrustumCulling } from "@/hooks/useFrustumCulling";

const _object = new THREE.Object3D();
const _color = new THREE.Color();

const MAX_INSTANCES = 500;

export function InstancedNodes() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const nodes = useCanvasStore((state) => state.nodes);
  
  const { camera } = useThree();
  const { quality } = usePerformanceAdaptive();
  const { updateFrustum, isPointVisible } = useFrustumCulling();

  const geometry = useMemo(() => new THREE.BoxGeometry(2.5, 2.5, 2.5), []);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: "#2a2a30",
    roughness: 0.8,
    metalness: 0.2,
    transparent: true,
    opacity: 0.6,
  }), []);

  // Update instance matrices when nodes change
  useEffect(() => {
    if (!meshRef.current) return;
    
    const count = Math.min(nodes.length, MAX_INSTANCES);

    // Hide all instances first
    for (let i = 0; i < MAX_INSTANCES; i++) {
      _object.position.set(0, -1000, 0);
      _object.scale.set(0, 0, 0);
      _object.updateMatrix();
      meshRef.current.setMatrixAt(i, _object.matrix);
    }

    nodes.forEach((node, i) => {
      if (i >= MAX_INSTANCES) return;
      
      _object.position.set(node.position.x, node.position.y || 0, node.position.z || 0);
      _object.scale.set(1, 1, 1);
      _object.rotation.set(0, 0, 0);
      _object.updateMatrix();
      
      meshRef.current!.setMatrixAt(i, _object.matrix);
      
      const hexColor = node.color || "#1F1F1F";
      _color.set(hexColor);
      meshRef.current!.setColorAt(i, _color);
    });

    meshRef.current.count = count;
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [nodes]);

  useFrame(() => {
    if (!meshRef.current || nodes.length === 0) return;

    updateFrustum();
    const thresholdMult = quality === "high" ? 1 : quality === "medium" ? 0.75 : 0.5;
    let needsUpdate = false;

    const count = Math.min(nodes.length, MAX_INSTANCES);

    nodes.forEach((node, i) => {
      if (i >= MAX_INSTANCES) return;
      
      _object.position.set(node.position.x, node.position.y || 0, node.position.z || 0);
      
      const isVisible = isPointVisible(_object.position);
      const distance = camera.position.distanceTo(_object.position);
      const isClose = distance < 35 * thresholdMult;

      if (!isVisible || isClose) {
        _object.scale.set(0, 0, 0);
      } else {
        _object.scale.set(1, 1, 1);
      }

      _object.updateMatrix();
      meshRef.current!.setMatrixAt(i, _object.matrix);
      needsUpdate = true;
    });

    if (needsUpdate) {
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  if (nodes.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, MAX_INSTANCES]}
      castShadow={quality === "high"}
      receiveShadow={quality === "high"}
    />
  );
}
