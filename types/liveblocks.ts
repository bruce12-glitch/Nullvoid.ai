export type Presence = {
  cursor: { x: number; y: number; z?: number } | null;
  selectedNodeId?: string | null;
  isThinking?: boolean;
  // Keep compatibility with legacy flow
  thinking?: boolean;
};

export type UserMeta = {
  id: string;
  info: {
    name: string;
    avatar: string;
    color: string;
  };
};

export type RoomEvent = 
  | { type: "AI_GENERATION_START" } 
  | { type: "AI_GENERATION_COMPLETE"; specId: string } 
  | { type: "NODE_MUTATED"; nodeId: string }
  | { type: "CHAT_MESSAGE"; message: string }
  // Keep compatibility with legacy flow
  | { type: "ai-status"; message: string; status: "start" | "thinking" | "complete" | "error" };
