"use client"

/**
 * Collab facade — suspense variants.
 *
 * Suspense hooks guarantee non-null values once the room is connected.
 * The solo implementations never suspend and always return valid values,
 * so they satisfy the same contract.
 */

import * as live from "@liveblocks/react/suspense"
import * as solo from "./solo"

export const COLLAB_ENABLED = process.env.NEXT_PUBLIC_COLLAB_ENABLED === "true"

export const useOthers = (COLLAB_ENABLED ? live.useOthers : solo.useOthers) as typeof live.useOthers
export const useSelf = (COLLAB_ENABLED ? live.useSelf : solo.useSelf) as typeof live.useSelf
export const useStorage = (COLLAB_ENABLED ? live.useStorage : solo.useStorage) as typeof live.useStorage
export const useMutation = (COLLAB_ENABLED ? live.useMutation : solo.useMutation) as typeof live.useMutation
export const useEventListener = (COLLAB_ENABLED ? live.useEventListener : solo.useEventListener) as typeof live.useEventListener
export const useBroadcastEvent = (COLLAB_ENABLED ? live.useBroadcastEvent : solo.useBroadcastEvent) as typeof live.useBroadcastEvent
export const useMyPresence = (COLLAB_ENABLED ? live.useMyPresence : solo.useMyPresence) as typeof live.useMyPresence
export const useUpdateMyPresence = (COLLAB_ENABLED ? live.useUpdateMyPresence : solo.useUpdateMyPresence) as typeof live.useUpdateMyPresence
