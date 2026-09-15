import api from "./api";
import type { GenerateAIResponse } from "../types/ai-assistant.props";

export async function generateAI(prompt: string) {
  const response = await api.post<GenerateAIResponse>("/ai/generate", {
    prompt,
  });

  return response.data.data;
}
