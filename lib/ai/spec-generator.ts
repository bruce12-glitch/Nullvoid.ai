import { z } from "zod";
import { CanvasExportSchema, SystemSpecSchema } from "@/lib/validations/canvas";
import { getGeminiClient, getDefaultModel } from "./gemini-client";
import { SYSTEM_ARCHITECT_PROMPT } from "./prompts/system-architect";

// Combine both schemas into a single expected AI payload
export const ArchitectureGenerationSchema = z.object({
  overview: z.string(),
  nodes: CanvasExportSchema.shape.nodes,
  edges: CanvasExportSchema.shape.edges,
  specification: SystemSpecSchema.omit({ id: true, projectId: true, title: true, version: true, overview: true }),
});

export type ArchitectureGenerationResponse = z.infer<typeof ArchitectureGenerationSchema>;

export async function generateArchitectureSpec(
  prompt: string,
  context?: string,
  retries = 2
): Promise<ArchitectureGenerationResponse> {
  const client = getGeminiClient();
  const model = client.models.get({ model: getDefaultModel("flash") });
  
  const fullPrompt = `USER REQUEST: ${prompt}\n\nCONTEXT:\n${context || "Empty canvas"}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await client.models.generateContent({
        model: getDefaultModel("flash"),
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
      const validated = ArchitectureGenerationSchema.parse(parsedJson);
      return validated;
    } catch (error) {
      if (attempt === retries) {
        console.error("Gemini Generation failed after max retries:", error);
        throw error;
      }
      // Exponential backoff
      await new Promise(res => setTimeout(res, Math.pow(2, attempt) * 1000));
    }
  }

  throw new Error("Failed to generate architecture spec");
}
