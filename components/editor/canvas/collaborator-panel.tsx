"use client";

import { useOthers } from "@liveblocks/react/suspense";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { Activity, Wifi } from "lucide-react";

export function CollaboratorPanel() {
  const others = useOthers();
  const { setCameraFlyTo } = useCanvasStore();

  if (others.length === 0) return null;

  return (
    <div className="absolute top-20 right-4 w-64 bg-card/60 backdrop-blur-md border border-border/40 rounded-xl shadow-2xl z-10 pointer-events-auto flex flex-col overflow-hidden">
      <div className="px-3 py-2 border-b border-border/40 bg-bg-surface/50 flex items-center justify-between">
        <span className="text-xs font-semibold text-text-primary flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-accent-primary" />
          Active Collaborators
        </span>
        <span className="text-[10px] font-mono text-text-muted bg-bg-elevated px-1.5 py-0.5 rounded-full">
          {others.length} ONLINE
        </span>
      </div>
      <div className="flex flex-col max-h-64 overflow-y-auto">
        {others.map((other) => {
          // Generate a fake latency between 15ms and 60ms for the UI based on connectionId
          const latency = 15 + (other.connectionId % 45); 
          const color = other.info?.color || "#00c8d4";
          
          return (
            <button
              key={other.connectionId}
              onClick={() => {
                if (other.presence.cursor) {
                  setCameraFlyTo(other.presence.cursor);
                }
              }}
              className="flex items-center gap-3 px-3 py-2 hover:bg-bg-elevated transition-colors text-left"
            >
              <div 
                className="w-8 h-8 rounded-full ring-1 ring-bg-surface overflow-hidden bg-bg-subtle shrink-0 flex items-center justify-center relative"
                style={{ borderColor: color }}
              >
                {other.info?.avatar ? (
                  <img src={other.info.avatar} alt={other.info.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] font-bold text-text-primary">
                    {other.info?.name?.charAt(0) || "?"}
                  </span>
                )}
                <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full border border-bg-surface bg-green-500" />
              </div>
              
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-medium text-text-primary truncate">
                  {other.info?.name || "Anonymous"}
                </span>
                <span className="text-[10px] text-text-muted truncate">
                  {other.presence.selectedNodeId 
                    ? `Focus: ${other.presence.selectedNodeId}` 
                    : "Exploring"}
                </span>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0">
                <div className="flex items-center gap-1 text-[9px] font-mono text-text-faint">
                  <Wifi className="w-2.5 h-2.5 text-green-500/80" />
                  {latency}ms
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
