"use client";

import { Html } from "@react-three/drei";

export function CanvasLoader() {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center gap-4">
        {/* Outer rotating ring */}
        <div className="relative w-16 h-16">
          <div 
            className="absolute inset-0 rounded-full border-2 border-transparent"
            style={{
              borderTopColor: '#00c8d4',
              borderRightColor: 'rgba(0, 200, 212, 0.3)',
              animation: 'spin 1.2s linear infinite',
            }}
          />
          <div 
            className="absolute inset-1 rounded-full border-2 border-transparent"
            style={{
              borderBottomColor: '#6457f9',
              borderLeftColor: 'rgba(100, 87, 249, 0.3)',
              animation: 'spin 1.8s linear infinite reverse',
            }}
          />
          {/* Center glow */}
          <div 
            className="absolute inset-0 m-auto w-4 h-4 rounded-full"
            style={{
              background: 'radial-gradient(circle, #00c8d4, transparent)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        </div>
        
        {/* Brand text */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-sm font-semibold text-white/90 tracking-wider" style={{ fontFamily: 'var(--font-geist-sans)' }}>
            NullVoid<span style={{ color: '#00c8d4' }}>.AI</span>
          </span>
          <span className="text-[10px] text-white/50 font-mono tracking-[0.2em] uppercase">
            Initializing 3D Scene
          </span>
        </div>

        {/* Loading dots */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div 
              key={i}
              className="w-1 h-1 rounded-full bg-accent-primary"
              style={{
                animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </Html>
  );
}
