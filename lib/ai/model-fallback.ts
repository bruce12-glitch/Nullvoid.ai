/**
 * Gemini model selection with automatic fallback + cooldown memory.
 *
 * Google retires model versions, load-sheds popular ones (503) and enforces
 * per-model daily quotas on free keys (429). A single hardcoded model id is
 * fragile, and re-probing a dead model on every request wastes 10-20s.
 * Models that fail with a capacity error are put on cooldown so subsequent
 * requests skip them instantly.
 */

interface CooldownEntry {
  until: number
  reason: string
}

const cooldowns = new Map<string, CooldownEntry>()

const QUOTA_COOLDOWN_MS = 30 * 60_000 // daily quota burned — skip for 30 min
const OVERLOAD_COOLDOWN_MS = 2 * 60_000 // transient 503 — skip for 2 min

export function geminiModelCandidates(): string[] {
  const candidates = [
    process.env.GEMINI_MODEL,
    // 3.6-flash is the most capable commonly-available flash model; the
    // -latest alias (currently 3.7) is frequently load-shed with 503s.
    "gemini-3.6-flash",
    "gemini-flash-latest",
    // Lite models: lower quality but separate (larger) quota pools — they
    // keep AI features alive when the flash quota is exhausted.
    "gemini-3.1-flash-lite",
    "gemini-flash-lite-latest",
    "gemini-3.5-flash-lite",
    "gemini-2.5-flash",
  ].filter((m): m is string => Boolean(m))
  const unique = [...new Set(candidates)]

  const now = Date.now()
  const available = unique.filter((m) => {
    const cd = cooldowns.get(m)
    return !cd || now >= cd.until
  })
  // Never return an empty list — if everything is cooling down, try all anyway.
  return available.length > 0 ? available : unique
}

/** True when the error is a capacity/quota problem — retrying the SAME model is pointless. */
export function isOverloadedError(error: unknown): boolean {
  const status = (error as { statusCode?: number })?.statusCode
  if (status === 503 || status === 429) return true
  const msg = (error as Error)?.message ?? ""
  return /high demand|overloaded|UNAVAILABLE|quota|RESOURCE_EXHAUSTED|no longer available/i.test(msg)
}

function isQuotaError(error: unknown): boolean {
  const status = (error as { statusCode?: number })?.statusCode
  const msg = (error as Error)?.message ?? ""
  return status === 429 || /quota|RESOURCE_EXHAUSTED/i.test(msg)
}

/** Record a model failure so subsequent requests skip it while it cools down. */
export function reportModelFailure(modelId: string, error: unknown): void {
  if (!isOverloadedError(error)) return
  const quota = isQuotaError(error)
  cooldowns.set(modelId, {
    until: Date.now() + (quota ? QUOTA_COOLDOWN_MS : OVERLOAD_COOLDOWN_MS),
    reason: quota ? "quota" : "overloaded",
  })
}

/**
 * Run `fn` against each candidate model until one succeeds.
 * Retries make sense across models, not within one — callers should pass
 * maxRetries: 1 to the AI SDK call inside `fn`.
 */
export async function withGeminiModelFallback<T>(
  fn: (modelId: string) => Promise<T>
): Promise<T> {
  const models = geminiModelCandidates()
  let lastError: unknown
  for (const modelId of models) {
    try {
      return await fn(modelId)
    } catch (error) {
      lastError = error
      reportModelFailure(modelId, error)
      console.warn(`[gemini] model ${modelId} failed, trying next candidate:`, (error as Error)?.message?.slice(0, 200))
    }
  }
  throw lastError
}
