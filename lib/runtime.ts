/**
 * Runtime service detection (server-side only).
 *
 * NullVoid runs in two modes:
 *  - FULL mode: all external services configured (Clerk, Liveblocks, Trigger.dev, Vercel Blob)
 *  - SOLO mode: any missing service is replaced by a local fallback so the app
 *    remains fully functional for a single user without external accounts.
 */

export function hasLiveblocks(): boolean {
  const key = process.env.LIVEBLOCKS_SECRET_KEY
  return Boolean(key && key.startsWith("sk_") && !key.includes("dummy"))
}

export function hasTrigger(): boolean {
  // The trigger.dev design/spec tasks write into Liveblocks storage, so the
  // background-job path is only viable when BOTH services are configured.
  return Boolean(process.env.TRIGGER_SECRET_KEY) && hasLiveblocks()
}

export function hasBlob(): boolean {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  return Boolean(token && token.startsWith("vercel_blob_rw_"))
}

export function hasClerk(): boolean {
  const key = process.env.CLERK_SECRET_KEY
  return Boolean(key && key.startsWith("sk_") && !key.includes("dummy") && !key.includes("preview"))
}

export function hasGemini(): boolean {
  return Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY)
}
