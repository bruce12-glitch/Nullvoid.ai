import { Liveblocks } from "@liveblocks/node";

const CURSOR_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
];

export function getUserColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash + userId.charCodeAt(i)) % CURSOR_COLORS.length;
  }
  return CURSOR_COLORS[hash];
}

function getLiveblocksSecretKey(): string {
  const key = process.env.LIVEBLOCKS_SECRET_KEY;
  if (!key) {
    throw new Error(
      "LIVEBLOCKS_SECRET_KEY is not set. Check your .env file."
    );
  }
  return key;
}

const globalForLiveblocks = globalThis as unknown as {
  liveblocks: Liveblocks | undefined;
};

export function getLiveblocks(): Liveblocks {
  if (!globalForLiveblocks.liveblocks) {
    globalForLiveblocks.liveblocks = new Liveblocks({
      secret: getLiveblocksSecretKey(),
    });
  }
  return globalForLiveblocks.liveblocks;
}
