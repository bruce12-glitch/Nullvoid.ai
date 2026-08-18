import { getGeminiClient } from "@/lib/ai/gemini-client";
import { geminiModelCandidates, isOverloadedError, reportModelFailure } from "@/lib/ai/model-fallback";
import { ITERATIVE_ARCHITECT_PROMPT } from "@/lib/ai/prompts/iterative-architect";
import { DeltaPatchResponseSchema, type DeltaPatchResponse } from "@/lib/ai/canvas-differ";
import type { CanvasNode, CanvasEdge } from "@/types/canvas";

export async function generateDeltaPatches(
  userPrompt: string,
  nodes: CanvasNode[],
  edges: CanvasEdge[],
  retries = 2
): Promise<DeltaPatchResponse> {
  const client = getGeminiClient();

  const canvasContext = JSON.stringify(
    {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type,
        label: n.label,
        position: n.position,
        status: n.status,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        sourceNodeId: e.sourceNodeId,
        targetNodeId: e.targetNodeId,
        type: e.type,
        label: e.label,
      })),
    },
    null,
    2
  );

  const fullPrompt = `USER REQUEST: ${userPrompt}

CURRENT CANVAS STATE:
${canvasContext}`;

  // Model-candidate chain with cooldown awareness; within a model, retry
  // only transient errors (capacity failures skip to the next model).
  const models = geminiModelCandidates();
  let lastError: unknown;
  for (const model of models) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await client.models.generateContent({
          model,
          contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
          config: {
            systemInstruction: ITERATIVE_ARCHITECT_PROMPT,
            responseMimeType: "application/json",
          },
        });

        const text = response.text;
        if (!text) throw new Error("Empty response from Gemini");

        const parsed = JSON.parse(text);
        return DeltaPatchResponseSchema.parse(parsed);
      } catch (error) {
        lastError = error;
        if (isOverloadedError(error)) {
          reportModelFailure(model, error);
          console.warn(`[gemini] model ${model} overloaded — next candidate`);
          break;
        }
        if (attempt === retries) break;
        await new Promise((res) => setTimeout(res, Math.pow(2, attempt) * 1000));
      }
    }
  }
  throw lastError;

  throw new Error("Failed to generate delta patches");
}
