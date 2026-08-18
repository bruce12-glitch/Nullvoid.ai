"use client"

import { CollabSuspense as ClientSideSuspense } from "@/lib/collab/provider"
import { ReactFlowProvider } from "@xyflow/react"
import { CanvasEditor } from "@/components/editor/canvas/canvas-editor"
import type { CanvasTemplate } from "@/components/editor/starter-templates"
import type { SaveStatus } from "@/hooks/use-canvas-autosave"

interface CanvasRoomProps {
  projectId: string
  pendingTemplate?: CanvasTemplate | null
  onTemplateImported?: () => void
  onSaveStatusChange?: (status: SaveStatus) => void
  onSaveReady?: (saveFn: () => void) => void
}

export function CanvasRoom({ projectId, pendingTemplate, onTemplateImported, onSaveStatusChange, onSaveReady }: CanvasRoomProps) {
  return (
    <div className="h-full w-full">
      <ClientSideSuspense fallback={<CanvasLoading />}>
        <ReactFlowProvider>
          <CanvasEditor
            projectId={projectId}
            pendingTemplate={pendingTemplate}
            onTemplateImported={onTemplateImported}
            onSaveStatusChange={onSaveStatusChange}
            onSaveReady={onSaveReady}
          />
        </ReactFlowProvider>
      </ClientSideSuspense>
    </div>
  )
}

function CanvasLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-bg-base">
      <div className="flex flex-col items-center justify-center p-6 bg-surface/60 backdrop-blur-md border border-border-default/40 rounded-3xl shadow-2xl">
        <div className="w-10 h-10 border-4 border-accent-primary/20 border-t-accent-primary rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-text-primary tracking-wide">Connecting to workspace...</p>
        <p className="text-xs text-text-muted mt-1 font-mono">Liveblocks Sync</p>
      </div>
    </div>
  )
}
