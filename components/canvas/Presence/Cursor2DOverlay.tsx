"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { useEventListener } from "@liveblocks/react/suspense";

interface Cursor2DOverlayProps {
  connectionId: number;
  x: number;
  y: number;
  z: number;
  color: string;
  name: string;
  avatar: string;
}

const CURSOR_SVG = `<svg width="24" height="36" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z" fill="currentColor"/></svg>`;

export function Cursor2DOverlay({ connectionId, x, y, z, color, name, avatar }: Cursor2DOverlayProps) {
  const groupRef = useRef<THREE.Group>(null);
  const targetPos = useRef(new THREE.Vector3(x, y, z));
  
  // Chat message state
  const [chatMessage, setChatMessage] = useState<string | null>(null);

  useEventListener(({ connectionId: eventConnectionId, event }) => {
    if (event.type === "CHAT_MESSAGE" && eventConnectionId === connectionId) {
      setChatMessage(event.message);
      setTimeout(() => {
        setChatMessage((current) => (current === event.message ? null : current));
      }, 5000);
    }
  });

  // Initialize group position on first render
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(x, y, z);
    }
    targetPos.current.set(x, y, z);
    // Only run once on mount to set initial position
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update target position when props change
  useEffect(() => {
    targetPos.current.set(x, y, z);
  }, [x, y, z]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      // Smooth interpolation for 60FPS DOM translation
      groupRef.current.position.lerp(targetPos.current, delta * 15);
    }
  });

  return (
    <group ref={groupRef}>
      <Html 
        center 
        zIndexRange={[100, 0]} 
        className="pointer-events-none select-none"
        style={{
          // Hardware accelerated layout wrapper inside Html
          willChange: 'transform'
        }}
      >
        <div className="relative -ml-[8px] -mt-[8px]">
          {/* Chat Bubble (Appears above the cursor) */}
          {chatMessage && (
            <div 
              className="absolute left-6 bottom-8 px-3 py-1.5 rounded-2xl rounded-bl-none shadow-xl backdrop-blur-md text-xs font-medium max-w-[200px] break-words animate-in zoom-in-95 duration-200"
              style={{ 
                backgroundColor: 'rgba(24, 24, 28, 0.85)', 
                border: `1px solid ${color}80`,
                color: '#f0f0f4'
              }}
            >
              {chatMessage}
            </div>
          )}

          {/* SVG Cursor Icon */}
          <div 
            style={{ color }} 
            className="drop-shadow-md origin-top-left text-current"
            dangerouslySetInnerHTML={{ __html: CURSOR_SVG }} 
          />
          
          {/* The Name Badge */}
          <div 
            className="absolute left-6 top-6 flex items-center gap-1.5 px-2 py-1 rounded-full shadow-lg backdrop-blur-md"
            style={{ 
              backgroundColor: `${color}33`, 
              border: `1px solid ${color}80`,
              color: '#f0f0f4'
            }}
          >
            {avatar ? (
              <img src={avatar} alt={name} className="w-4 h-4 rounded-full object-cover" />
            ) : (
              <div 
                className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
                style={{ backgroundColor: color, color: '#fff' }}
              >
                {name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-[10px] font-medium whitespace-nowrap">{name}</span>
          </div>
        </div>
      </Html>
    </group>
  );
}
