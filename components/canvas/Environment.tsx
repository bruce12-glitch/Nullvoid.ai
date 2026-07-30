"use client";

import { Environment as DreiEnvironment, ContactShadows } from "@react-three/drei";
import { useCanvasPreferences } from "@/hooks/useCanvasPreferences";

export function StageEnvironment() {
  const { enableShadows, performanceMode } = useCanvasPreferences();
  
  const shadowResolution = performanceMode === "quality" ? 2048 : 512;
  const contactShadowResolution = performanceMode === "quality" ? 1024 : 256;

  return (
    <>
      <ambientLight intensity={0.5} />
      
      {/* Soft Key Light */}
      <directionalLight
        position={[10, 15, 10]}
        intensity={1.2}
        castShadow={enableShadows}
        shadow-mapSize-width={shadowResolution}
        shadow-mapSize-height={shadowResolution}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      {/* Rim Light */}
      <directionalLight 
        position={[-10, 5, -15]} 
        intensity={2} 
        color="#3b82f6" 
      />

      {/* Global Environment */}
      <DreiEnvironment preset="city" />

      {/* Contact Shadows on the floor */}
      {enableShadows && (
        <ContactShadows 
          position={[0, -0.01, 0]} 
          opacity={0.6} 
          scale={20} 
          blur={2.5} 
          far={10} 
          resolution={contactShadowResolution} 
          color="#000000" 
        />
      )}
    </>
  );
}
