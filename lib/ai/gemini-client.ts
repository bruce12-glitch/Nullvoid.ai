import { GoogleGenAI } from "@google/genai";

let geminiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (geminiClient) return geminiClient;

  const apiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GOOGLE_GENERATIVE_AI_API_KEY / GEMINI_API_KEY environment variable for Gemini client");
  }

  geminiClient = new GoogleGenAI({ apiKey });
  return geminiClient;
}

/**
 * Model selection. The `-latest` aliases always resolve to a currently
 * available model, avoiding hard failures when Google retires versions.
 * Override with GEMINI_MODEL / GEMINI_PRO_MODEL.
 */
export function getDefaultModel(preferred: "pro" | "flash" = "flash"): string {
  if (preferred === "pro") return process.env.GEMINI_PRO_MODEL || "gemini-pro-latest";
  return process.env.GEMINI_MODEL || "gemini-flash-latest";
}
