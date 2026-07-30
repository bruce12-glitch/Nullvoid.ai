"use client";

import { Box, Shapes, Sparkles, PanelLeftClose } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LeftSidebar() {
  return (
    <div className="absolute top-22 bottom-24 left-4 w-64 flex flex-col bg-card/60 backdrop-blur-md border border-border/40 rounded-xl shadow-2xl z-10 pointer-events-auto overflow-hidden text-card-foreground">
      <div className="flex items-center justify-between p-3 border-b border-border-default/50">
        <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Toolbox</span>
        <Button variant="ghost" size="icon-xs" className="text-muted-foreground hover:text-foreground">
          <PanelLeftClose className="w-3.5 h-3.5" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-subtle cursor-pointer hover:bg-elevated transition-colors">
          <Box className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">3D System Nodes</span>
        </div>
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-subtle transition-colors">
          <Shapes className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Shapes</span>
        </div>
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-subtle transition-colors">
          <Sparkles className="w-4 h-4 text-chart-2" />
          <span className="text-sm font-medium text-muted-foreground">AI Specs</span>
        </div>
      </div>
    </div>
  );
}
