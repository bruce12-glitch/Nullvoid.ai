"use client";

import { useEffect } from "react";
import { useCanvasTools, ActiveTool } from "@/hooks/useCanvasTools";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { useCanvasHistory } from "@/stores/useCanvasHistory";
import { canvasFSMActor } from "@/hooks/useCanvasFSM";
import { useReplaceStorageCRDT } from "@/hooks/useLiveblocksCanvasSync";
import type { NodeType } from "@/types/canvas";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  ChevronDown,
  Check,
  LucideIcon
} from "lucide-react";

const NODE_TYPES: { type: NodeType; label: string; color: string }[] = [
  { type: "SERVICE", label: "Service", color: "#3b82f6" },
  { type: "DATABASE", label: "Database", color: "#22c55e" },
  { type: "API_GATEWAY", label: "API Gateway", color: "#8b5cf6" },
  { type: "MESSAGE_QUEUE", label: "Message Queue", color: "#f59e0b" },
  { type: "STORAGE_BUCKET", label: "Storage Bucket", color: "#06b6d4" },
  { type: "AUTH_PROVIDER", label: "Auth Provider", color: "#ec4899" },
  { type: "ROBOT_UNIT", label: "Robot Unit", color: "#6366f1" },
];

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
  const setCameraFlyTo = useCanvasStore((s) => s.setCameraFlyTo);
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const setNodes = useCanvasStore((s) => s.setNodes);
  const setEdges = useCanvasStore((s) => s.setEdges);
  const activeNodeTypeToPlace = useCanvasStore((s) => s.activeNodeTypeToPlace);
  const { canUndo, canRedo, undo, redo } = useCanvasHistory();
  const replaceStorageCRDT = useReplaceStorageCRDT();
  const activeTool = useCanvasTools((s) => s.activeTool);

  // Leaving ADD_NODE / CONNECT tool exits the FSM connecting/placing states
  useEffect(() => {
    if (activeTool === "ADD_NODE" || activeTool === "CONNECT") return;
    const state = canvasFSMActor.getSnapshot();
    if (state.matches("connecting") || state.matches("placingNode")) {
      canvasFSMActor.send({ type: "CANCEL" });
      useCanvasStore.getState().setActiveNodeTypeToPlace(null);
    }
  }, [activeTool]);

  const handleUndo = () => {
    const restored = undo(nodes, edges);
    if (restored) {
      setNodes(restored.nodes);
      setEdges(restored.edges);
      replaceStorageCRDT?.(restored.nodes, restored.edges);
    }
  };

  const handleRedo = () => {
    const restored = redo(nodes, edges);
    if (restored) {
      setNodes(restored.nodes);
      setEdges(restored.edges);
      replaceStorageCRDT?.(restored.nodes, restored.edges);
    }
  };

  const handleStartPlacingNode = () => {
    const type = activeNodeTypeToPlace || "SERVICE";
    useCanvasStore.getState().setActiveNodeTypeToPlace(type);
    useCanvasTools.getState().setActiveTool("ADD_NODE");
    canvasFSMActor.send({ type: "START_PLACING_NODE" });
  };

  const handleStartConnect = () => {
    useCanvasTools.getState().setActiveTool("CONNECT");
    canvasFSMActor.send({ type: "START_CONNECT" });
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
      <div className="bg-card/60 backdrop-blur-md border border-border/40 shadow-2xl rounded-2xl p-1.5 flex items-center gap-1">
        
        {/* Navigation Group */}
        <ToolbarButton tool="SELECT" icon={MousePointer} label="Select" shortcut="V" />
        <ToolbarButton tool="PAN" icon={Hand} label="Pan Hand" shortcut="H" />
        <ToolbarButton 
          icon={Focus} 
          label="Reset View" 
          shortcut="Home"
          onClick={() => setCameraFlyTo({ x: 0, y: 3, z: 8 })} 
        />
        
        <Separator orientation="vertical" className="h-8 mx-1 bg-border/40" />
        
        {/* Node & Creation Group */}
        <div className="flex items-center gap-0.5">
          <ToolbarButton tool="ADD_NODE" icon={Box} label="Add 3D Node" shortcut="N" onClick={handleStartPlacingNode} />
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <button
                className={`p-1.5 rounded-lg flex items-center justify-center transition-all duration-200 text-muted-foreground hover:bg-card/80 hover:text-foreground ${activeTool === "ADD_NODE" ? "text-accent-primary" : ""}`}
                aria-label="Choose node type"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            } />
            <DropdownMenuContent align="center" side="top">
              <DropdownMenuLabel>Node Type</DropdownMenuLabel>
              {NODE_TYPES.map((nt) => (
                <DropdownMenuItem
                  key={nt.type}
                  onClick={() => {
                    useCanvasStore.getState().setActiveNodeTypeToPlace(nt.type);
                  }}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: nt.color }} />
                  {nt.label}
                  {activeNodeTypeToPlace === nt.type && <Check className="ml-auto h-3.5 w-3.5" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <ToolbarButton tool="CONNECT" icon={GitFork} label="Connect" shortcut="C" onClick={handleStartConnect} />
        
        <Separator orientation="vertical" className="h-8 mx-1 bg-border/40" />

        {/* 3D Transform Group */}
        <ToolbarButton tool="GIZMO_TRANSLATE" icon={Move} label="Translate" shortcut="T" />
        <ToolbarButton tool="GIZMO_ROTATE" icon={RotateCw} label="Rotate" shortcut="R" />
        <ToolbarButton tool="GIZMO_SCALE" icon={Maximize2} label="Scale" shortcut="S" />

        <Separator orientation="vertical" className="h-8 mx-1 bg-border/40" />

        {/* History & AI Group */}
        <ToolbarButton 
          icon={Undo2} 
          label="Undo" 
          shortcut="Cmd+Z" 
          onClick={handleUndo}
          isActive={canUndo}
        />
        <ToolbarButton 
          icon={Redo2} 
          label="Redo" 
          shortcut="Cmd+Shift+Z" 
          onClick={handleRedo}
          isActive={canRedo}
        />
        
        <div className="ml-1">
          <ToolbarButton tool="AI_PROMPT" icon={Sparkles} label="AI Assist" shortcut="K" accent />
        </div>

      </div>
    </div>
  );
}
