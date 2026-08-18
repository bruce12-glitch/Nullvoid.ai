/**
 * Gemini model selection with automatic fallback.
 *
 * Google retires model versions and load-sheds popular ones (503s), so a
 * single hardcoded model id is fragile. We try a chain of candidates in
 * order until one answers.
 */

export function geminiModelCandidates(): string[] {
  const candidates = [
    process.env.GEMINI_MODEL,
    // 3.6-flash has proven the most reliable under load; the -latest alias
    // (currently 3.7) is frequently load-shed with 503s.
    "gemini-3.6-flash",
    "gemini-flash-latest",
    "gemini-3.1-flash-lite",
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
  ].filter((m): m is string => Boolean(m))
  return [...new Set(candidates)]
}

/** True when the error is a capacity/quota problem — retrying the SAME model is pointless. */
export function isOverloadedError(error: unknown): boolean {
  const status = (error as { statusCode?: number })?.statusCode
  if (status === 503 || status === 429) return true
  const msg = (error as Error)?.message ?? ""
  return /high demand|overloaded|UNAVAILABLE|quota|RESOURCE_EXHAUSTED|no longer available/i.test(msg)
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
      console.warn(`[gemini] model ${modelId} failed, trying next candidate:`, (error as Error)?.message?.slice(0, 200))
    }
  }
  throw lastError
}
