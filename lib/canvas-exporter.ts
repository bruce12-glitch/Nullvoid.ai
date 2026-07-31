/**
 * WebGL Canvas Snapshot Utility
 * Captures a high-resolution PNG image of the current 3D canvas viewport.
 * Requires `preserveDrawingBuffer: true` on the WebGLRenderer.
 */

interface CaptureOptions {
  transparent?: boolean;
  filename?: string;
}

export function captureCanvasSnapshot(options?: CaptureOptions) {
  if (typeof document === "undefined") return false;
  const canvasElements = document.getElementsByTagName("canvas");
  
  if (canvasElements.length === 0) {
    console.error("No canvas element found for export.");
    return;
  }

  // Assuming the first canvas is our primary R3F canvas
  const canvas = canvasElements[0];
  
  try {
    // We already have preserveDrawingBuffer: true on the renderer,
    // so we can safely extract the data URL directly from the canvas.
    const dataURL = canvas.toDataURL("image/png");

    // Optional: We could process transparency here, but since alpha is set to true on the gl context, 
    // it will be transparent by default if no environment background is explicitly drawn.
    // However, if we want to force a background color, we would need to draw it to an offscreen 2D canvas first.
    // For this implementation, we will export exactly what the WebGL context renders.

    const filename = options?.filename || `nullvoid-architecture-${Date.now()}.png`;

    // Trigger browser file download
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error("Failed to capture canvas snapshot:", error);
    return false;
  }
}
