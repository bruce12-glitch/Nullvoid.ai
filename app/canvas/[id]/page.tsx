"use client"

import { use } from "react"
import { CollabProvider, CollabSuspense as ClientSideSuspense } from "@/lib/collab/provider"
import { EditorLayout } from "@/components/editor/EditorLayout";
import { Scene } from "@/components/canvas/Scene";

function WorkspaceLoading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-bg-base">
      <div className="flex flex-col items-center justify-center p-8 bg-surface/60 backdrop-blur-md border border-border-default/40 rounded-3xl shadow-2xl">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-accent-primary/20 border-t-accent-primary animate-spin" />
          <div className="absolute inset-1.5 rounded-full border-2 border-accent-ai/20 border-b-accent-ai animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.2s" }} />
        </div>
        <p className="text-sm font-medium text-text-primary tracking-wide mt-5">Connecting to shared canvas...</p>
        <p className="text-xs text-text-muted mt-1 font-mono">Liveblocks Realtime Sync</p>
      </div>
    </div>
  );
}

export default function CanvasWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <CollabProvider roomId={id} title="Architecture">
        <ClientSideSuspense fallback={<WorkspaceLoading />}>
          <EditorLayout projectId={id}>
            <Scene />
          </EditorLayout>
        </ClientSideSuspense>
    </CollabProvider>
  );
}
