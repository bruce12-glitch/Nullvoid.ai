"use client"

/**
 * CollabProvider — mounts the Liveblocks room in FULL mode, or renders
 * children directly in SOLO mode (local state, no external service).
 */

import type { ReactNode } from "react"
import { Suspense, useEffect, useState } from "react"
import { LiveblocksProvider, RoomProvider } from "@liveblocks/react"
import { LiveObject, LiveMap } from "@liveblocks/client"

export const COLLAB_ENABLED = process.env.NEXT_PUBLIC_COLLAB_ENABLED === "true"

interface CollabProviderProps {
  roomId: string
  title?: string
  children: ReactNode
}

export function CollabProvider({ roomId, title = "New Architecture", children }: CollabProviderProps) {
  if (!COLLAB_ENABLED) {
    return <>{children}</>
  }

  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id={roomId}
        initialPresence={{ cursor: null, selectedNodeId: null, isThinking: false, thinking: false }}
        initialStorage={{
          nodes: new LiveMap(),
          edges: new LiveMap(),
          systemMetadata: new LiveObject({ title, updatedAt: new Date().toISOString() }),
        }}
      >
        {children}
      </RoomProvider>
    </LiveblocksProvider>
  )
}

/**
 * Suspense boundary that works in both modes. In FULL mode Liveblocks hooks
 * suspend until the room connects; in SOLO mode nothing suspends but we still
 * defer to the client to avoid SSR/browser markup mismatches for canvas UIs.
 */
export function CollabSuspense({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <>{fallback}</>
  return <Suspense fallback={fallback}>{children}</Suspense>
}
