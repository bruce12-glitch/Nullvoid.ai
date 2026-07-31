"use client";

import { useState } from "react";
import { Box, Shapes, Sparkles, PanelLeftClose, Layers, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  color: string;
  bgColor: string;
}

const sidebarItems: SidebarItem[] = [
  { 
    id: "nodes", 
    icon: <Box className="w-4 h-4" />, 
    label: "Nodes",
    color: "text-accent-primary",
    bgColor: "bg-accent-primary/15"
  },
  { 
    id: "layers", 
    icon: <Layers className="w-4 h-4" />, 
    label: "Layers",
    color: "text-accent-ai-text",
    bgColor: "bg-accent-ai/15"
  },
  { 
    id: "shapes", 
    icon: <Shapes className="w-4 h-4" />, 
    label: "Shapes",
    color: "text-state-success",
    bgColor: "bg-state-success/15"
  },
  { 
    id: "specs", 
    icon: <Sparkles className="w-4 h-4" />, 
    label: "AI Specs",
    color: "text-state-warning",
    bgColor: "bg-state-warning/15"
  },
];

export function LeftSidebar() {
  const [activeItem, setActiveItem] = useState("nodes");
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isCollapsed) {
    return (
      <div className="absolute top-22 left-4 w-12 flex flex-col items-center bg-card/60 backdrop-blur-md border border-border/40 rounded-2xl shadow-2xl z-10 pointer-events-auto overflow-hidden text-card-foreground py-2 gap-1 animate-slide-in-bottom">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-muted-foreground hover:text-foreground mb-1"
          onClick={() => setIsCollapsed(false)}
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveItem(item.id);
              setIsCollapsed(false);
            }}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
              activeItem === item.id 
                ? `${item.bgColor} ${item.color}` 
                : 'text-muted-foreground hover:bg-bg-subtle/60'
            }`}
          >
            {item.icon}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="absolute top-22 bottom-24 left-4 w-64 flex flex-col bg-card/60 backdrop-blur-md border border-border/40 rounded-2xl shadow-2xl z-10 pointer-events-auto overflow-hidden text-card-foreground animate-slide-in-bottom">
      <div className="flex items-center justify-between p-3 border-b border-border/40">
        <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Toolbox</span>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
          onClick={() => setIsCollapsed(true)}
        >
          <PanelLeftClose className="w-3.5 h-3.5" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveItem(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
              activeItem === item.id 
                ? `bg-bg-subtle/80 ${item.color}` 
                : 'hover:bg-bg-subtle/60 text-text-muted hover:text-foreground'
            }`}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${
              activeItem === item.id ? item.bgColor : 'bg-bg-elevated group-hover:bg-bg-subtle'
            }`}>
              {item.icon}
            </div>
            <span className="text-sm font-medium transition-colors">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Bottom info */}
      <div className="p-3 border-t border-border/40">
        <div className="text-[10px] text-text-faint text-center font-mono">
          Drag nodes to canvas
        </div>
      </div>
    </div>
  );
}
