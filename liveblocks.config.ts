import type { LiveMap, LiveObject } from "@liveblocks/client"
import type { CanvasNode, CanvasEdge } from "@/types/canvas"
import type { Presence, UserMeta, RoomEvent } from "@/types/liveblocks"

declare global {
  interface Liveblocks {
    Presence: Presence;

    Storage: {
      nodes: LiveMap<string, LiveObject<CanvasNode & Record<string, any>>>;
      edges: LiveMap<string, LiveObject<CanvasEdge & Record<string, any>>>;
      systemMetadata: LiveObject<{ title: string; updatedAt: string }>;
    };

    UserMeta: UserMeta;

    RoomEvent: RoomEvent;

    ThreadMetadata: Record<string, never>;

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

    RoomInfo: Record<string, never>;

    GroupInfo: Record<string, never>;
  }
}

export {};
