"use client"

/**
 * Collab facade — React Flow binding.
 *
 * In FULL mode this is @liveblocks/react-flow's CRDT-synced flow state.
 * In SOLO mode it is a local implementation with the same return shape.
 */

import { useLiveblocksFlow as liveUseLiveblocksFlow } from "@liveblocks/react-flow"
import { useLiveblocksFlow as soloUseLiveblocksFlow } from "./solo"

export const COLLAB_ENABLED = process.env.NEXT_PUBLIC_COLLAB_ENABLED === "true"

export const useLiveblocksFlow = (
  COLLAB_ENABLED ? liveUseLiveblocksFlow : soloUseLiveblocksFlow
) as typeof liveUseLiveblocksFlow
