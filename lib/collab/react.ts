"use client"

/**
 * Collab facade — non-suspense variants.
 *
 * Re-exports the real Liveblocks hooks when realtime collaboration is
 * configured (NEXT_PUBLIC_COLLAB_ENABLED === "true"), otherwise the local
 * solo-mode implementations. The flag is inlined at build time, so hook
 * order is stable and tree-shaking removes the unused branch.
 */

import * as live from "@liveblocks/react"
import * as solo from "./solo"

export const COLLAB_ENABLED = process.env.NEXT_PUBLIC_COLLAB_ENABLED === "true"

export const useStorage = (COLLAB_ENABLED ? live.useStorage : solo.useStorage) as typeof live.useStorage
export const useMutation = (COLLAB_ENABLED ? live.useMutation : solo.useMutation) as typeof live.useMutation
export const useOthers = (COLLAB_ENABLED ? live.useOthers : solo.useOthers) as typeof live.useOthers
export const useSelf = (COLLAB_ENABLED ? live.useSelf : solo.useSelf) as typeof live.useSelf
export const useMyPresence = (COLLAB_ENABLED ? live.useMyPresence : solo.useMyPresence) as typeof live.useMyPresence
export const useUpdateMyPresence = (COLLAB_ENABLED ? live.useUpdateMyPresence : solo.useUpdateMyPresence) as typeof live.useUpdateMyPresence
export const useEventListener = (COLLAB_ENABLED ? live.useEventListener : solo.useEventListener) as typeof live.useEventListener
export const useBroadcastEvent = (COLLAB_ENABLED ? live.useBroadcastEvent : solo.useBroadcastEvent) as typeof live.useBroadcastEvent
export const useUndo = (COLLAB_ENABLED ? live.useUndo : solo.useUndo) as typeof live.useUndo
export const useRedo = (COLLAB_ENABLED ? live.useRedo : solo.useRedo) as typeof live.useRedo
export const useCanUndo = (COLLAB_ENABLED ? live.useCanUndo : solo.useCanUndo) as typeof live.useCanUndo
export const useCanRedo = (COLLAB_ENABLED ? live.useCanRedo : solo.useCanRedo) as typeof live.useCanRedo
export const useFeedMessages = (COLLAB_ENABLED ? live.useFeedMessages : solo.useFeedMessages) as typeof live.useFeedMessages
export const useCreateFeed = (COLLAB_ENABLED ? live.useCreateFeed : solo.useCreateFeed) as typeof live.useCreateFeed
export const useCreateFeedMessage = (COLLAB_ENABLED ? live.useCreateFeedMessage : solo.useCreateFeedMessage) as typeof live.useCreateFeedMessage
