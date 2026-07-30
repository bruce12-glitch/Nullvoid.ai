import type { CanvasNode, CanvasEdge } from "@/types/canvas";

export async function applyLayoutEngine(
  nodes: CanvasNode[],
  edges: CanvasEdge[]
): Promise<CanvasNode[]> {
  return new Promise((resolve, reject) => {
    try {
      // Initialize the web worker using Next.js URL syntax
      const worker = new Worker(new URL("../../workers/layout-worker.ts", import.meta.url));
      
      worker.onmessage = (event) => {
        resolve(event.data as CanvasNode[]);
        worker.terminate();
      };
      
      worker.onerror = (err) => {
        console.error("Layout worker error:", err);
        reject(err);
        worker.terminate();
      };
      
      // Post data to the worker
      worker.postMessage({ nodes, edges });
    } catch (e) {
      console.error("Failed to start layout worker, falling back to sync layout...", e);
      reject(e);
    }
  });
}
