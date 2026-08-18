import { z } from "zod";
import { CanvasExportSchema, SystemSpecSchema } from "@/lib/validations/canvas";
import { getGeminiClient } from "./gemini-client";
import { geminiModelCandidates, isOverloadedError } from "./model-fallback";
import { SYSTEM_ARCHITECT_PROMPT } from "./prompts/system-architect";

// Combine both schemas into a single expected AI payload
export const ArchitectureGenerationSchema = z.object({
  overview: z.string(),
  nodes: CanvasExportSchema.shape.nodes,
  edges: CanvasExportSchema.shape.edges,
  specification: SystemSpecSchema.omit({ id: true, projectId: true, title: true, version: true, overview: true }),
});

export type ArchitectureGenerationResponse = z.infer<typeof ArchitectureGenerationSchema>;

/* ------------------------------------------------------------------ */
/* Lenient normalization                                               */
/*                                                                     */
/* Models frequently omit boilerplate fields (rotation/scale/metadata) */
/* or use React-Flow-style edge keys. Normalize before strict Zod      */
/* validation so a structurally-sound response never fails.            */
/* ------------------------------------------------------------------ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeVector(v: any, fallback: { x: number; y: number; z?: number }) {
  if (Array.isArray(v) && v.length >= 2) {
    return { x: Number(v[0]) || 0, y: Number(v[1]) || 0, z: Number(v[2]) || 0 };
  }
  if (v && typeof v === "object" && typeof v.x === "number") return v;
  return fallback;
}

const VALID_STATUSES = ["active", "warning", "error", "idle"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeArchitectureResponse(raw: any): any {
  if (!raw || typeof raw !== "object") return raw;
  const out = { ...raw };

  out.overview =
    typeof out.overview === "string" && out.overview
      ? out.overview
      : typeof out.specification?.overview === "string"
        ? out.specification.overview
        : "AI-generated system architecture.";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  out.nodes = (Array.isArray(out.nodes) ? out.nodes : []).map((n: any) => ({
    ...n,
    id: String(n?.id ?? ""),
    label: typeof n?.label === "string" ? n.label : String(n?.id ?? "Node"),
    position: normalizeVector(n?.position, { x: 0, y: 0, z: 0 }),
    rotation: normalizeVector(n?.rotation, { x: 0, y: 0, z: 0 }),
    scale: normalizeVector(n?.scale, { x: 1, y: 1, z: 1 }),
    metadata: n?.metadata && typeof n.metadata === "object" ? n.metadata : {},
    status: VALID_STATUSES.includes(n?.status) ? n.status : "active",
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  out.edges = (Array.isArray(out.edges) ? out.edges : []).map((e: any, i: number) => ({
    ...e,
    id: String(e?.id ?? `edge-${i}`),
    sourceNodeId: String(e?.sourceNodeId ?? e?.source ?? ""),
    targetNodeId: String(e?.targetNodeId ?? e?.target ?? ""),
  }));

  const spec = out.specification && typeof out.specification === "object" ? out.specification : {};
  out.specification = {
    services: Array.isArray(spec.services)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? spec.services.map((s: any) => ({
          name: String(s?.name ?? "Service"),
          type: String(s?.type ?? "SERVICE"),
          description: String(s?.description ?? ""),
          techStack: Array.isArray(s?.techStack) ? s.techStack.map(String) : [],
        }))
      : [],
    security: {
      authMethod: String(spec.security?.authMethod ?? "JWT"),
      encryption: String(spec.security?.encryption ?? "TLS in transit"),
      compliance: Array.isArray(spec.security?.compliance) ? spec.security.compliance.map(String) : [],
    },
    infrastructure: {
      cloudProvider: String(spec.infrastructure?.cloudProvider ?? "AWS"),
      region: String(spec.infrastructure?.region ?? "us-east-1"),
      estimateCost: String(spec.infrastructure?.estimateCost ?? spec.infrastructure?.estimatedCost ?? "n/a"),
    },
  };

  return out;
}

export async function generateArchitectureSpec(
  prompt: string,
  context?: string,
  retries = 2
): Promise<ArchitectureGenerationResponse> {
  const client = getGeminiClient();

  const fullPrompt = `USER REQUEST: ${prompt}\n\nCONTEXT:\n${context || "Empty canvas"}`;

  // Try each model candidate; within a candidate, retry only transient
  // (non-capacity) errors — 503/429 skip straight to the next model.
  const models = geminiModelCandidates();
  for (const model of models) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await client.models.generateContent({
          model,
          contents: [
            {
              role: "user",
              parts: [{ text: fullPrompt }],
            }
          ],
          config: {
            systemInstruction: SYSTEM_ARCHITECT_PROMPT,
            responseMimeType: "application/json",
          },
        });

        const text = response.text;
        if (!text) {
          throw new Error("Empty response from Gemini");
        }

        const parsedJson = JSON.parse(text);
        const validated = ArchitectureGenerationSchema.parse(normalizeArchitectureResponse(parsedJson));
        return validated;
      } catch (error) {
        if (isOverloadedError(error)) {
          console.warn(`[gemini] model ${model} overloaded — moving to next candidate`);
          break; // capacity issue: next model immediately, no backoff
        }
        const isLast = attempt === retries;
        if (isLast) {
          console.warn(`[gemini] model ${model} failed after ${retries + 1} attempts:`, (error as Error)?.message?.slice(0, 200));
          break; // move on to the next model candidate
        }
        // Exponential backoff for transient errors (parse/network)
        await new Promise(res => setTimeout(res, Math.pow(2, attempt) * 1000));
      }
    }
  }

  throw new Error("Failed to generate architecture spec");
}
