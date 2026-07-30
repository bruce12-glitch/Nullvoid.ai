import * as THREE from "three";

/**
 * Calculates a dynamic 3D Quadratic Bezier control point.
 * This forces the edge to arch overhead, avoiding collision with intermediate nodes.
 */
export function calculateEdgeControlPoint(
  source: THREE.Vector3,
  target: THREE.Vector3
): THREE.Vector3 {
  // Find the midpoint between source and target
  const mid = new THREE.Vector3().lerpVectors(source, target, 0.5);
  
  // Calculate horizontal distance between nodes
  const distance = source.distanceTo(target);
  
  // Dynamic arc height based on distance (farther = higher arc)
  // Clamp between 1.5 (close) and 4.0 (far)
  const arcHeight = THREE.MathUtils.clamp(distance * 0.3, 1.5, 4.0);
  
  // Set the Y coordinate of the control point to lift the curve overhead
  mid.y += arcHeight;
  
  return mid;
}
