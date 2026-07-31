"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment as DreiEnvironment, ContactShadows } from "@react-three/drei";
import { useCanvasPreferences } from "@/hooks/useCanvasPreferences";
import * as THREE from "three";

function AnimatedLights() {
  const pointLightRef = useRef<THREE.PointLight>(null);
  const spotLightRef = useRef<THREE.SpotLight>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Subtle pulsing point light
    if (pointLightRef.current) {
      pointLightRef.current.intensity = 1.5 + Math.sin(t * 0.8) * 0.3;
    }

    // Slowly orbiting spot light
    if (spotLightRef.current) {
      spotLightRef.current.position.x = Math.cos(t * 0.2) * 12;
      spotLightRef.current.position.z = Math.sin(t * 0.2) * 12;
    }
  });

  return (
    <>
      {/* Pulsing accent point light */}
      <pointLight
        ref={pointLightRef}
        position={[0, 8, 0]}
        intensity={1.5}
        color="#00c8d4"
        distance={30}
        decay={2}
      />

      {/* Orbiting spot light for dramatic focus */}
      <spotLight
        ref={spotLightRef}
        position={[8, 12, 8]}
        intensity={2}
        color="#6457f9"
        angle={0.5}
        penumbra={0.8}
        distance={40}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Ground bounce light */}
      <pointLight
        position={[0, -2, 0]}
        intensity={0.3}
        color="#00c8d4"
        distance={15}
        decay={2}
      />
    </>
  );
}

export function StageEnvironment() {
  const { enableShadows, performanceMode } = useCanvasPreferences();
  
  const shadowResolution = performanceMode === "quality" ? 2048 : 512;
  const contactShadowResolution = performanceMode === "quality" ? 1024 : 256;

  return (
    <>
      {/* Atmospheric fog for depth */}
      <fog attach="fog" args={["#080809", 25, 60]} />
      
      <ambientLight intensity={0.3} />
      
      {/* Soft Key Light */}
      <directionalLight
        position={[10, 15, 10]}
        intensity={1.0}
        castShadow={enableShadows}
        shadow-mapSize-width={shadowResolution}
        shadow-mapSize-height={shadowResolution}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-bias={-0.001}
      />
      
      {/* Cyan Rim Light */}
      <directionalLight 
        position={[-10, 5, -15]} 
        intensity={1.5} 
        color="#00c8d4" 
      />

      {/* Purple Back Light */}
      <directionalLight 
        position={[5, 3, -10]} 
        intensity={0.8} 
        color="#6457f9" 
      />

      {/* Animated accent lights */}
      <AnimatedLights />

      {/* Global Environment */}
      <DreiEnvironment preset="night" />

      {/* Contact Shadows on the floor */}
      {enableShadows && (
        <ContactShadows 
          position={[0, -0.01, 0]} 
          opacity={0.5} 
          scale={30} 
          blur={2.5} 
          far={15} 
          resolution={contactShadowResolution} 
          color="#000000" 
        />
      )}
    </>
  );
}
