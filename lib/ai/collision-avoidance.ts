import type { CanvasNode } from "@/types/canvas";

const NODE_SIZE = 2.5;
const MIN_GAP = 1.5;
const MIN_DISTANCE = NODE_SIZE + MIN_GAP;

export function applyCollisionAvoidance(nodes: CanvasNode[]): CanvasNode[] {
  // Deep clone nodes to avoid mutating original references, and guarantee a
  // position object so the distance math below never dereferences undefined.
  const resolvedNodes = (JSON.parse(JSON.stringify(nodes)) as CanvasNode[]).map((n) => ({
    ...n,
    position: n.position ?? { x: 0, y: 0, z: 0 },
  }));
  
  const iterations = 50;
  
  for (let iter = 0; iter < iterations; iter++) {
    let resolvedCollision = false;

    for (let i = 0; i < resolvedNodes.length; i++) {
      for (let j = i + 1; j < resolvedNodes.length; j++) {
        const nodeA = resolvedNodes[i];
        const nodeB = resolvedNodes[j];
        
        // Since our tiers enforce strict Z positioning, collisions mainly happen
        // if two nodes share the same Z (same tier) and have overlapping X
        const dz = (nodeA.position.z ?? 0) - (nodeB.position.z ?? 0);
        
        // Only resolve collisions for nodes in the same tier (or very close Z)
        if (Math.abs(dz) < 1.0) {
          const dx = nodeA.position.x - nodeB.position.x;
          const distX = Math.abs(dx);
          
          if (distX < MIN_DISTANCE) {
            // Collision detected! Apply repulsive vector offset
            resolvedCollision = true;
            
            // Amount to push apart
            const overlap = MIN_DISTANCE - distX;
            // Push them equally in opposite directions
            const push = (overlap / 2) + 0.1; // Add small epsilon
            
            if (dx > 0) {
              nodeA.position.x += push;
              nodeB.position.x -= push;
            } else if (dx < 0) {
              nodeA.position.x -= push;
              nodeB.position.x += push;
            } else {
              // Exact same spot, nudge arbitrarily
              nodeA.position.x += push;
              nodeB.position.x -= push;
            }
          }
        }
      }
    }

    // Early exit if no collisions were found in this sweep
    if (!resolvedCollision) {
      break;
    }
  }

  return resolvedNodes;
}
