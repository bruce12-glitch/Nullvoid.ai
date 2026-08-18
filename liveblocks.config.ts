import type { LiveMap, LiveObject } from "@liveblocks/client"
import type { CanvasNode, CanvasEdge } from "@/types/canvas"
import type { Presence, UserMeta, RoomEvent } from "@/types/liveblocks"

declare global {
  interface Liveblocks {
    Presence: Presence;

    // The canvas graph lives under `flow` because `useLiveblocksFlow()`
    // (@liveblocks/react-flow) uses storage key "flow" by default and
    // auto-creates this subtree on mount. Declaring the maps at the root
    // instead produced a split-brain room: React Flow wrote to `flow.*`
    // while every hand-written reader/writer used empty root-level maps,
    // so node renames, recolours and edge labels silently did nothing.
    Storage: {
      flow: LiveObject<{
        nodes: LiveMap<string, LiveObject<CanvasNode & Record<string, any>>>;
        edges: LiveMap<string, LiveObject<CanvasEdge & Record<string, any>>>;
      }>;
      systemMetadata: LiveObject<{ title: string; updatedAt: string }>;
    };

    UserMeta: UserMeta;

    RoomEvent: RoomEvent;

    ThreadMetadata: {};

    ActivitiesData: {
      "$aiStatusFeed": {
        text?: string;
        status?: "start" | "thinking" | "complete" | "error";
      };
      "$aiChatFeed": {
        sender?: string;
        role?: "user" | "assistant";
        content?: string;
        timestamp?: string;
      };
    };

    RoomInfo: {};

    GroupInfo: {};
  }
}

export {};
