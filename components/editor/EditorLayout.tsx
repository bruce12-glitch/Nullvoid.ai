"use client";

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

interface EditorLayoutProps {
  children: React.ReactNode; // The 3D Canvas
  projectId: string;
}

export function EditorLayout({ children, projectId }: EditorLayoutProps) {
  useKeyboardShortcuts();
  
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-bg-base">
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
        <ChatPanel />
      </div>
    </div>
  );
}
