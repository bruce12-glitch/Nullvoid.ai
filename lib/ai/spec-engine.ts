/**
 * Spec engine — shared core of the technical-spec generator.
 *
 * Used by trigger/generate-spec.ts (background job) and by
 * app/api/ai/spec/route.ts as an inline fallback when Trigger.dev
 * is not configured.
 */

import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { withGeminiModelFallback } from "@/lib/ai/model-fallback"
import { generateText } from "ai"

export interface SpecChatMessage {
  role: "user" | "assistant"
  content: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LooseNode = Record<string, any>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LooseEdge = Record<string, any>

export const SPEC_SYSTEM_PROMPT = `You are Ghost AI, a senior technical architect. Generate a comprehensive Markdown technical specification document based on the provided architecture canvas and conversation context.

Structure the spec as follows:
1. **Overview** — What the system does and its key goals
2. **Architecture** — High-level architecture description based on the canvas
3. **Components** — Each node/service with its role and responsibilities
4. **Data Flow** — How data and requests move through the system
5. **Technology Choices** — Suggested technologies that fit the architecture
6. **Key Considerations** — Scalability, security, and performance notes

Write in clear, professional technical language. Use Markdown headers, bullet points, and code blocks where appropriate. Be specific and actionable.`

export function buildSpecContext(nodes: LooseNode[], edges: LooseEdge[], chatHistory: SpecChatMessage[]): string {
  const nodeLines = nodes
    .map((n) => {
      const label = n.data?.label ?? n.id
      const shape = n.data?.shape ?? "rectangle"
      const pos = n.position ? ` at (${Math.round(n.position.x)}, ${Math.round(n.position.y)})` : ""
      return `- ${label} (id: ${n.id}, shape: ${shape}${pos})`
    })
    .join("\n")

  const edgeLines = edges
    .map((e) => {
      const label = e.data?.label ? ` [${e.data.label}]` : ""
      return `- ${e.source} → ${e.target}${label}`
    })
    .join("\n")

  const chatLines = chatHistory
    .map((m) => `${m.role === "user" ? "User" : "Ghost AI"}: ${m.content}`)
    .join("\n")

  return [
    "## Canvas Nodes",
    nodeLines || "(none)",
    "",
    "## Canvas Connections",
    edgeLines || "(none)",
    "",
    "## Chat History",
    chatLines || "(none)",
  ].join("\n")
}

/** Generate the Markdown spec text with Gemini. */
export async function generateSpecMarkdown(
  nodes: LooseNode[],
  edges: LooseEdge[],
  chatHistory: SpecChatMessage[]
): Promise<string> {
  const apiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY
  if (!apiKey) throw new Error("Missing Gemini API key (GOOGLE_GENERATIVE_AI_API_KEY)")

  const google = createGoogleGenerativeAI({ apiKey })
  const result = await withGeminiModelFallback((modelId) =>
    generateText({
      model: google(modelId),
      system: SPEC_SYSTEM_PROMPT,
      prompt: buildSpecContext(nodes, edges, chatHistory),
      maxRetries: 1,
    })
  )
  return result.text
}
