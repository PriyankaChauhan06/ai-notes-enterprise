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

  totalToolCalls: number;

  toolUsage: {
    search_my_notes: number;
    get_note: number;
    create_note: number;
    update_note: number;
    delete_note: number;
  };
}
