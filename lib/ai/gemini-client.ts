import { GoogleGenAI } from "@google/genai";

let geminiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (geminiClient) return geminiClient;

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY or GOOGLE_AI_API_KEY environment variable for Gemini client");
  }

  geminiClient = new GoogleGenAI({ apiKey });
  return geminiClient;
}

export function getDefaultModel(preferred: "pro" | "flash" = "flash"): string {
  if (preferred === "pro") return "gemini-2.5-pro";
  return "gemini-2.5-flash";
}
