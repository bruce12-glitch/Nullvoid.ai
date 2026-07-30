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

    ThreadMetadata: {};

    FeedMessageData: {
      // ai-status-feed
      text?: string;
      status?: "start" | "thinking" | "complete" | "error";
      // ai-chat feed
      sender?: string;
      role?: "user" | "assistant";
      content?: string;
      timestamp?: string;
    };

    RoomInfo: {};
  }
}

export {};
