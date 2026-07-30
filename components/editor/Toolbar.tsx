"use client";

import { useCanvasTools, ActiveTool } from "@/hooks/useCanvasTools";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  MousePointer, 
  Hand, 
  Focus, 
  Box, 
  GitFork, 
  Move, 
  RotateCw, 
  Maximize2, 
  Sparkles, 
  Undo2, 
  Redo2,
  LucideIcon
} from "lucide-react";

interface ToolbarButtonProps {
  tool?: ActiveTool;
  icon: LucideIcon;
  label: string;
  shortcut?: string;
  onClick?: () => void;
  isActive?: boolean;
  accent?: boolean;
}

function ToolbarButton({ tool, icon: Icon, label, shortcut, onClick, isActive, accent }: ToolbarButtonProps) {
  const { activeTool, setActiveTool } = useCanvasTools();
  
  const isSelected = isActive ?? (tool ? activeTool === tool : false);
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (tool) {
      setActiveTool(tool);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger render={
        <button
          onClick={handleClick}
          className={`relative p-2 rounded-xl flex items-center justify-center transition-all duration-200
            ${isSelected 
              ? "bg-gradient-to-b from-primary to-primary/85 text-primary-foreground shadow-[0_2px_0_0_rgba(0,0,0,0.3),inset_0_1px_0_0_rgba(255,255,255,0.15)]" 
              : "text-muted-foreground hover:bg-card/80 hover:text-foreground"
            }
            ${accent && !isSelected ? "text-accent-ai hover:text-accent-ai-text shadow-[0_0_10px_rgba(100,87,249,0.3)] hover:shadow-[0_0_20px_rgba(100,87,249,0.5)]" : ""}
          `}
        >
          <Icon className="w-5 h-5" />
        </button>
      } />
      <TooltipContent className="bg-popover/90 backdrop-blur-md border-border/40 text-popover-foreground">
        <p className="flex items-center gap-2">
          {label}
          {shortcut && (
            <span className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-mono">
              {shortcut}
            </span>
          )}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

export function Toolbar() {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
      <div className="bg-card/60 backdrop-blur-md border border-border/40 shadow-2xl rounded-2xl p-1.5 flex items-center gap-1">
        
        {/* Navigation Group */}
        <ToolbarButton tool="SELECT" icon={MousePointer} label="Select" shortcut="V" />
        <ToolbarButton tool="PAN" icon={Hand} label="Pan Hand" shortcut="H" />
        <ToolbarButton icon={Focus} label="Reset View" onClick={() => console.log("Reset View")} />
        
        <Separator orientation="vertical" className="h-8 mx-1 bg-border/40" />
        
        {/* Node & Creation Group */}
        <ToolbarButton tool="ADD_NODE" icon={Box} label="Add 3D Node" shortcut="N" />
        <ToolbarButton tool="CONNECT" icon={GitFork} label="Connect" shortcut="C" />
        
        <Separator orientation="vertical" className="h-8 mx-1 bg-border/40" />

        {/* 3D Transform Group */}
        <ToolbarButton tool="GIZMO_TRANSLATE" icon={Move} label="Translate" shortcut="T" />
        <ToolbarButton tool="GIZMO_ROTATE" icon={RotateCw} label="Rotate" shortcut="R" />
        <ToolbarButton tool="GIZMO_SCALE" icon={Maximize2} label="Scale" shortcut="S" />

        <Separator orientation="vertical" className="h-8 mx-1 bg-border/40" />

        {/* History & AI Group */}
        <ToolbarButton icon={Undo2} label="Undo" shortcut="Cmd+Z" onClick={() => console.log("Undo")} />
        <ToolbarButton icon={Redo2} label="Redo" shortcut="Cmd+Shift+Z" onClick={() => console.log("Redo")} />
        
        <div className="ml-1">
          <ToolbarButton tool="AI_PROMPT" icon={Sparkles} label="AI Assist" shortcut="K" accent />
        </div>

      </div>
    </div>
  );
}
