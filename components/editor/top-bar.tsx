"use client";

import { useState } from "react";
import { Share, Activity, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserButtonWrapper } from "@/components/auth/user-button-wrapper";
import { ExportModal } from "./ExportModal";
import { AnalyticsPanel } from "./AnalyticsPanel";
import { useOthers } from "@liveblocks/react/suspense";
import { useCanvasStore } from "@/stores/useCanvasStore";

export function TopBar() {
  const others = useOthers();
  const { setCameraFlyTo } = useCanvasStore();
  const displayOthers = others.slice(0, 5);
  const overflow = others.length - 5;
  const [showAnalytics, setShowAnalytics] = useState(false);

  return (
    <>
      <div className="absolute top-4 left-4 right-4 h-14 flex items-center justify-between px-4 bg-card/60 backdrop-blur-md border border-border/40 rounded-xl shadow-2xl z-10 pointer-events-auto text-card-foreground">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20">
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-tight text-foreground">NullVoid.AI</span>
            <span className="text-[10px] text-muted-foreground font-mono leading-tight">Live Canvas</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 mr-4 rounded-full bg-chart-3/10 border border-chart-3/20">
            <div className="w-1.5 h-1.5 rounded-full bg-chart-3 animate-pulse" />
            <span className="text-xs font-medium text-chart-3">Live / Syncing</span>
          </div>

          {/* Analytics & Costs Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAnalytics(true)}
            className="h-8 gap-1.5 text-muted-foreground hover:text-foreground px-2.5"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="text-xs hidden sm:inline">Analytics</span>
          </Button>
          
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <Share className="w-4 h-4" />
          </Button>
          <ExportModal />
          
          {others.length > 0 && (
            <div className="ml-4 flex items-center">
              <div className="flex -space-x-2">
                {displayOthers.map((other) => (
                  <button 
                    key={other.connectionId} 
                    onClick={() => {
                      if (other.presence.cursor) setCameraFlyTo(other.presence.cursor);
                    }}
                    className="w-8 h-8 rounded-full ring-2 ring-bg-surface overflow-hidden bg-bg-elevated flex items-center justify-center relative hover:scale-110 transition-transform cursor-pointer"
                    style={{ borderColor: other.info?.color }}
                  >
                    {other.info?.avatar ? (
                      <img src={other.info.avatar} alt={other.info.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-bold text-text-primary">
                        {other.info?.name?.charAt(0) || "?"}
                      </span>
                    )}
                  </button>
                ))}
                {overflow > 0 && (
                  <div className="w-8 h-8 rounded-full ring-2 ring-bg-surface bg-bg-subtle flex items-center justify-center text-[10px] font-bold text-text-muted z-10">
                    +{overflow}
                  </div>
                )}
              </div>
              <div className="w-px h-5 bg-border-default/60 ml-4 mr-2" />
            </div>
          )}

          <div className="ml-2 flex items-center">
            <UserButtonWrapper />
          </div>
        </div>
      </div>

      {/* Analytics Panel Modal */}
      {showAnalytics && <AnalyticsPanel onClose={() => setShowAnalytics(false)} />}
    </>
  );
}
