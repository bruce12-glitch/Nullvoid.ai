import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { usePerformanceAdaptive } from "@/hooks/usePerformanceAdaptive";
import { useFrustumCulling } from "@/hooks/useFrustumCulling";

const _object = new THREE.Object3D();
const _color = new THREE.Color();

export function InstancedNodes() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const nodes = useCanvasStore((state) => state.nodes);
  
  const { camera } = useThree();
  const { quality } = usePerformanceAdaptive();
  const { updateFrustum, isPointVisible } = useFrustumCulling();

  // Create geometry and material once
  const geometry = useMemo(() => new THREE.BoxGeometry(2.5, 2.5, 2.5), []);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: "#2a2a30",
    roughness: 0.8,
    metalness: 0.2
  }), []);

  // Update instance matrices when nodes change
  useEffect(() => {
    if (!meshRef.current || nodes.length === 0) return;
    
    // We only update static positions here. Dynamic per-frame updates happen in useFrame if needed,
    // but typically architecture nodes are static unless being dragged.
    
    nodes.forEach((node, i) => {
      _object.position.set(node.position.x, node.position.y || 0, node.position.z || 0);
      _object.scale.set(1, 1, 1);
      _object.rotation.set(0, 0, 0);
      _object.updateMatrix();
      
      meshRef.current!.setMatrixAt(i, _object.matrix);
      
      // Set color based on node type or metadata
      const hexColor = node.color || "#1F1F1F";
      _color.set(hexColor);
      meshRef.current!.setColorAt(i, _color);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [nodes]);

  useFrame(() => {
    if (!meshRef.current || nodes.length === 0) return;

    // For absolute maximum FPS, we can scale instances to 0 if they are culled or too close (handled by LODNode)
    updateFrustum();
    const thresholdMult = quality === "high" ? 1 : quality === "medium" ? 0.75 : 0.5;
    let needsUpdate = false;

    nodes.forEach((node, i) => {
      _object.position.set(node.position.x, node.position.y || 0, node.position.z || 0);
      
      // 1. Culling check
      const isVisible = isPointVisible(_object.position);
      
      // 2. Distance check (LODNode takes over if close)
      const distance = camera.position.distanceTo(_object.position);
      const isClose = distance < 35 * thresholdMult;

      if (!isVisible || isClose) {
        // Hide instance
        _object.scale.set(0, 0, 0);
      } else {
        // Show instance
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
      args={[geometry, material, nodes.length]}
      castShadow={quality === "high"}
      receiveShadow={quality === "high"}
    />
  );
}
