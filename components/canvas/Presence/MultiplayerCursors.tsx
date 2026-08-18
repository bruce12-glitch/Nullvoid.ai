"use client";

import { useOthers } from "@/lib/collab/suspense";
import { Cursor2DOverlay } from "./Cursor2DOverlay";
import { useSpatialPresence } from "@/hooks/useSpatialPresence";

export function MultiplayerCursors() {
  const others = useOthers();
  useSpatialPresence();

  return (
    <>
      {others.map((other) => {
        if (!other.presence.cursor || !other.info) return null;
        
        return (
          <Cursor2DOverlay
            key={other.connectionId}
            connectionId={other.connectionId}
            x={other.presence.cursor.x}
            y={other.presence.cursor.y}
            z={other.presence.cursor.z || 0}
            color={other.info.color || "#00c8d4"}
            name={other.info.name || "Anonymous"}
            avatar={other.info.avatar || ""}
          />
        );
      })}
    </>
  );
}
