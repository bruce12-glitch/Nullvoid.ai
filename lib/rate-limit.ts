/**
 * Simple in-memory sliding-window rate limiter, shared by AI routes.
 *
 * Per-serverless-instance, so it's a coarse guard against unbounded Gemini
 * token burn rather than a hard global limit. For multi-instance production
 * deployments swap this for Redis/Upstash.
 */

interface WindowEntry {
  count: number
  resetAt: number
}

const buckets = new Map<string, WindowEntry>()

const DEFAULT_WINDOW_MS = 60_000
const MAX_BUCKETS = 10_000

export interface RateLimitResult {
  limited: boolean
  remaining: number
  retryAfterSeconds: number
}

export function rateLimit(
  key: string,
  max: number,
  windowMs: number = DEFAULT_WINDOW_MS
): RateLimitResult {
  const now = Date.now()

  // Opportunistic cleanup so the map can't grow unbounded.
  if (buckets.size > MAX_BUCKETS) {
    for (const [k, v] of buckets) {
      if (now >= v.resetAt) buckets.delete(k)
    }
  }

  const entry = buckets.get(key)
  if (!entry || now >= entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { limited: false, remaining: max - 1, retryAfterSeconds: 0 }
  }

  entry.count += 1
  const limited = entry.count > max
  return {
    limited,
    remaining: Math.max(0, max - entry.count),
    retryAfterSeconds: limited ? Math.ceil((entry.resetAt - now) / 1000) : 0,
  }
}

export function rateLimitResponse(result: RateLimitResult): Response {
  return Response.json(
    { error: "Rate limit exceeded. Please try again in a minute." },
    { status: 429, headers: { "Retry-After": String(result.retryAfterSeconds || 60) } }
  )
}

/* ---------------- AI input guards ---------------- */

export const AI_LIMITS = {
  promptMaxChars: 4_000,
  maxNodes: 300,
  maxEdges: 600,
  maxChatMessages: 60,
  chatMessageMaxChars: 4_000,
} as const

export function clampPrompt(prompt: string): string {
  return prompt.slice(0, AI_LIMITS.promptMaxChars)
}
