import api from "./api";
import type {
  AIHistoryResponse,
  AskAIRequest,
  AskAIResponse,
  GenerateAIAndRAGResponse,
} from "../types/ai-assistant.props";

export async function generateAI(prompt: string) {
  const response = await api.post<GenerateAIAndRAGResponse>("/ai/generate", {
    prompt,
  });

  return response.data.data;
}

export async function askAI({ question, conversationId }: AskAIRequest) {
  const payload: { question: string; conversationId?: string } = { question };

  if (conversationId) payload.conversationId = conversationId;

  const response = await api.post<AskAIResponse>("/ai/agent", payload);
  return response.data.data;
}

export async function getAIHistory() {
  const response = await api.get<AIHistoryResponse>("/ai/history");

  return response.data.data;
}
