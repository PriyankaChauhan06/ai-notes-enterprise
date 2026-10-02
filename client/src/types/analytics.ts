export type AnalyticsRange = "today" | "7d" | "30d";

export interface AnalyticsSummary {
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalEstimatedCost: number;
  averageDurationMs: number;

  totalToolCalls?: number;

  toolUsage: {
    search_my_notes: number;
    get_note: number;
    create_note: number;
    update_note: number;
    delete_note: number;
  };
}

export interface AgentRunToolCall {
  toolName: string;
  risk: "read" | "low_write" | "high_write" | "destructive";
  durationMs: number;
  success: boolean;
  error?: string;
}

export interface AgentRun {
  id: string;
  conversationId: string;
  question: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  status: "success" | "failed";
  durationMs: number;
  toolCalls: AgentRunToolCall[];
  error?: string;
  createdAt: string;
  updatedAt: string;
}
