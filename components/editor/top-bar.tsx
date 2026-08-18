"use client";

import { useState } from "react";
import { Share, Activity, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserButtonWrapper } from "@/components/auth/user-button-wrapper";
import { ExportModal } from "./ExportModal";
import { AnalyticsPanel } from "./AnalyticsPanel";
import { useOthers } from "@/lib/collab/suspense";
import { useCanvasStore } from "@/stores/useCanvasStore";

export function TopBar() {
  const others = useOthers();
  const setCameraFlyTo = useCanvasStore((s) => s.setCameraFlyTo);
  const displayOthers = others.slice(0, 5);
  const overflow = others.length - 5;
  const [showAnalytics, setShowAnalytics] = useState(false);

  return (
    <>
      <div className="absolute top-4 left-4 right-4 h-14 flex items-center justify-between px-5 bg-gradient-to-r from-card/70 to-card/50 backdrop-blur-xl border border-border/30 rounded-2xl shadow-2xl shadow-black/20 z-10 pointer-events-auto text-card-foreground animate-slide-in-bottom">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-accent-primary to-accent-ai shadow-lg shadow-accent-primary/15 animate-glow-pulse">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-tight text-foreground tracking-tight">NullVoid<span className="text-accent-primary">.AI</span></span>
            <span className="text-[10px] text-text-faint font-mono leading-tight">Live Canvas</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1.5 px-3 py-1 mr-2 rounded-full bg-state-success/10 border border-state-success/20 animate-border-glow">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-state-success opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-state-success" />
            </span>
            <span className="text-[10px] font-medium text-state-success tracking-wide">Live</span>
          </div>

          {/* Analytics & Costs Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAnalytics(true)}
            className="h-8 gap-1.5 text-text-muted hover:text-text-primary px-2.5 hover:bg-bg-elevated/50 transition-all duration-200"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="text-xs hidden sm:inline">Analytics</span>
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-text-muted hover:text-text-primary hover:bg-bg-elevated/50 transition-all duration-200"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href).catch(() => {});
            }}
          >
            <Share className="w-4 h-4" />
          </Button>
          <ExportModal />
          
          {others.length > 0 && (
            <div className="ml-2 flex items-center">
              <div className="flex -space-x-2">
                {displayOthers.map((other) => (
                  <button 
                    key={other.connectionId} 
                    onClick={() => {
                      if (other.presence.cursor) setCameraFlyTo(other.presence.cursor);
                    }}
                    className="w-7 h-7 rounded-full ring-2 ring-bg-surface overflow-hidden bg-bg-elevated flex items-center justify-center relative hover:scale-110 hover:z-10 transition-all duration-200 cursor-pointer"
                    style={{ borderColor: other.info?.color || '#00c8d4' }}
                    title={other.info?.name}
                  >
                    {other.info?.avatar ? (
                      <img src={other.info.avatar} alt={other.info.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[9px] font-bold text-text-primary">
                        {other.info?.name?.charAt(0) || "?"}
                      </span>
                    )}
                  </button>
                ))}
                {overflow > 0 && (
                  <div className="w-7 h-7 rounded-full ring-2 ring-bg-surface bg-bg-subtle flex items-center justify-center text-[9px] font-bold text-text-muted z-10">
                    +{overflow}
                  </div>
                )}
              </div>
              <div className="w-px h-5 bg-border-default/40 ml-3 mr-1" />
            </div>
          )}

          <div className="ml-1 flex items-center">
            <UserButtonWrapper />
          </div>
        </div>
      </div>

      {/* Analytics Panel Modal */}
      {showAnalytics && <AnalyticsPanel onClose={() => setShowAnalytics(false)} />}
    </>
  );
}
