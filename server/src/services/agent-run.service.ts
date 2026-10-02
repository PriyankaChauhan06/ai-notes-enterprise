import AgentRun from "../models/AgentRun";
import { ToolRisk } from "../ai/tool-risk";

interface RecordAgentRunData {
  userId: string;
  conversationId: string;
  question: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  status: "success" | "failed";
  durationMs: number;
  toolCalls: Array<{
    toolName: string;
    risk: ToolRisk;
    durationMs: number;
    success: boolean;
    error?: string;
  }>;
  error?: string;
}

export async function recordAgentRun(data: RecordAgentRunData) {
  return AgentRun.create(data);
}

export async function getAgentRuns(userId: string, limit = 20) {
  return AgentRun.find({ userId }).sort({ createdAt: -1 }).limit(limit).lean();
}
