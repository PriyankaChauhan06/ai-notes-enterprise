import type { ToolRisk } from "../ai/tool-risk";

export interface RunAgentData {
  userId: string;
  question: string;
  conversationId?: string;
}

export interface ToolCallLog {
  toolName: string;
  risk: ToolRisk;
  durationMs: number;
  success: boolean;
  error?: string;
}

export interface AgentContext {
  userId: string;
  question: string;
  conversation: any;
  toolCallLogs: ToolCallLog[];
  agentStartTime: number;
  hasRecordedRun: boolean;
  model?: any,
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  createdNote?: any;
  deletedNote?: any;
}
