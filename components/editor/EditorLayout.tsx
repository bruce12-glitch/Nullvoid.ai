"use client";

import { useCallback } from "react";
import { TopBar } from "./top-bar";
import { LeftSidebar } from "./left-sidebar";
import { InspectorPanel } from "./inspector-panel";
import { Toolbar } from "./Toolbar";
import { LiveChatBubble } from "@/components/canvas/Presence/LiveChatBubble";
import { CollaboratorPanel } from "@/components/editor/canvas/collaborator-panel";
import { AIGenerationBanner } from "@/components/editor/AIGenerationBanner";
import { SpecSidebar } from "@/components/editor/SpecSidebar";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { ChatPanel } from "@/components/editor/ChatPanel";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { useCanvasHistory } from "@/stores/useCanvasHistory";
import { useReplaceStorageCRDT } from "@/hooks/useLiveblocksCanvasSync";
import { CanvasPersistence } from "@/components/canvas/CanvasPersistence";

interface EditorLayoutProps {
  children: React.ReactNode; // The 3D Canvas
  projectId: string;
}

export function EditorLayout({ children, projectId }: EditorLayoutProps) {
  const setNodes = useCanvasStore((s) => s.setNodes);
  const setEdges = useCanvasStore((s) => s.setEdges);
  const replaceStorageCRDT = useReplaceStorageCRDT();

  const handleUndo = useCallback(() => {
    const { nodes, edges } = useCanvasStore.getState();
    const restored = useCanvasHistory.getState().undo(nodes, edges);
    if (restored) {
      setNodes(restored.nodes);
      setEdges(restored.edges);
      replaceStorageCRDT?.(restored.nodes, restored.edges);
    }
  }, [setNodes, setEdges, replaceStorageCRDT]);

  const handleRedo = useCallback(() => {
    const { nodes, edges } = useCanvasStore.getState();
    const restored = useCanvasHistory.getState().redo(nodes, edges);
    if (restored) {
      setNodes(restored.nodes);
      setEdges(restored.edges);
      replaceStorageCRDT?.(restored.nodes, restored.edges);
    }
  }, [setNodes, setEdges, replaceStorageCRDT]);

  useKeyboardShortcuts({ undo: handleUndo, redo: handleRedo });
  
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-bg-base selection:bg-accent-primary/20">
      {/* Load + autosave the 3D canvas (renders nothing) */}
      <CanvasPersistence projectId={projectId} />

      {/* Ambient lighting with multiple layers */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Primary accent glow */}
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-accent-primary/3 blur-[150px]" />
        {/* AI accent glow */}
        <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] rounded-full bg-accent-ai/3 blur-[120px]" />
        {/* Subtle center glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-accent-primary/1 blur-[200px]" />
      </div>

      {/* 3D Canvas Background Layer (z-0) */}
      <div className="absolute inset-0 z-0">
        {children}
      </div>

      {/* 2D Glassmorphic Overlay Layer (z-10) */}
      {/* pointer-events-none ensures we can click through to the 3D canvas where there are no panels */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <TopBar />
        <LeftSidebar />
        <InspectorPanel />
        <Toolbar />
        <LiveChatBubble />
        <CollaboratorPanel />
        <AIGenerationBanner />
        <SpecSidebar projectId={projectId} />
        <ChatPanel projectId={projectId} />
      </div>
    </div>
  );
}
