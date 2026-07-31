"use client"

import { useEffect } from "react"
import type { ReactFlowInstance } from "@xyflow/react"
import { useCanvasStore } from "@/stores/useCanvasStore"
import { useCanvasTools } from "@/hooks/useCanvasTools"
import { useDeleteNodesCRDT } from "@/hooks/useLiveblocksCanvasSync"
import { canvasFSMActor } from "@/hooks/useCanvasFSM"

interface Options {
  reactFlow?: ReactFlowInstance | null
  undo?: () => void
  redo?: () => void
}

function isEditable(el: Element | null): boolean {
  if (!el) return false
  const tag = (el as HTMLElement).tagName
  if (tag === "INPUT" || tag === "TEXTAREA") return true
  if ((el as HTMLElement).isContentEditable) return true
  return false
}

export function useKeyboardShortcuts(options?: Options) {
  const { reactFlow, undo, redo } = options || {}
  const { deleteSelectedNodes, clearSelection, selectAllNodes, selectedNodeIds } = useCanvasStore()
  
  // Liveblocks CRDT mutation (safe: returns no-op if not inside RoomProvider)
  const deleteNodesCRDT = useDeleteNodesCRDT();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (isEditable(document.activeElement)) return

      const meta = event.metaKey || event.ctrlKey

      // 2D React Flow Shortcuts
      if (!meta && (event.key === "+" || event.key === "=")) {
        event.preventDefault()
        reactFlow?.zoomIn({ duration: 200 })
        return
      }

      if (!meta && event.key === "-") {
        event.preventDefault()
        reactFlow?.zoomOut({ duration: 200 })
        return
      }

      if (meta && event.shiftKey && event.key === "z") {
        event.preventDefault()
        redo?.()
        return
      }

      if (meta && !event.shiftKey && event.key === "z") {
        event.preventDefault()
        undo?.()
        return
      }

      if (meta && event.key === "y") {
        event.preventDefault()
        redo?.()
        return
      }

      // 3D Canvas / Selection Shortcuts
      if (event.key === "Delete" || event.key === "Backspace") {
        if (selectedNodeIds.length > 0) {
          // Sync the delete to CRDT AND clear the local store/selection so
          // stale selected ids don't linger after the CRDT round-trip.
          deleteNodesCRDT(selectedNodeIds)
          deleteSelectedNodes()
        }
      } else if (event.key === "Escape") {
        canvasFSMActor.send({ type: "CANCEL" })
        useCanvasStore.getState().setActiveNodeTypeToPlace(null)
        useCanvasTools.getState().setActiveTool("SELECT")
        clearSelection()
      } else if (meta && event.key === "a") {
        event.preventDefault()
        selectAllNodes()
      } else if (!meta) {
        const key = event.key.toLowerCase()
        // Tool Hotkeys
        if (key === "v") {
          useCanvasTools.getState().setActiveTool("SELECT")
        } else if (key === "h") {
          useCanvasTools.getState().setActiveTool("PAN")
        } else if (key === "n") {
          const type = useCanvasStore.getState().activeNodeTypeToPlace || "SERVICE"
          useCanvasStore.getState().setActiveNodeTypeToPlace(type)
          useCanvasTools.getState().setActiveTool("ADD_NODE")
          canvasFSMActor.send({ type: "START_PLACING_NODE" })
        } else if (key === "c") {
          useCanvasTools.getState().setActiveTool("CONNECT")
          canvasFSMActor.send({ type: "START_CONNECT" })
        } else if (key === "k") {
          useCanvasTools.getState().setActiveTool("AI_PROMPT")
        } else if (key === "t" || key === "w") {
          useCanvasTools.getState().setActiveTool("GIZMO_TRANSLATE")
        } else if (key === "r" || key === "e") {
          useCanvasTools.getState().setActiveTool("GIZMO_ROTATE")
        } else if (key === "s") {
          useCanvasTools.getState().setActiveTool("GIZMO_SCALE")
        }
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [reactFlow, undo, redo, deleteSelectedNodes, clearSelection, selectAllNodes, selectedNodeIds, deleteNodesCRDT])
}
