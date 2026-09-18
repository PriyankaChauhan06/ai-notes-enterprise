import api from "./api";
import type { GenerateAIAndRAGResponse } from "../types/ai-assistant.props";

export async function generateAI(prompt: string) {
  const response = await api.post<GenerateAIAndRAGResponse>("/ai/generate", {
    prompt,
  });

  return response.data.data;
}

export async function askAI(question: string) {
  const response = await api.post<GenerateAIAndRAGResponse>("/ai/ask", {
    question,
  });

  return response.data.data;
}
