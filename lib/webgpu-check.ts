/**
 * Utility to check WebGPU hardware availability on the browser client
 * with fallback recommendation for WebGL2 rendering.
 */

export async function isWebGPUSupported(): Promise<boolean> {
  if (typeof window === "undefined" || !navigator) {
    return false;
  }
  
  if (!("gpu" in navigator)) {
    return false;
  }

  try {
    const gpu = (navigator as unknown as { gpu: { requestAdapter: () => Promise<unknown> } }).gpu;
    const adapter = await gpu.requestAdapter();
    return !!adapter;
  } catch (error) {
    console.warn("WebGPU adapter request failed, falling back to WebGL2:", error);
    return false;
  }
}
