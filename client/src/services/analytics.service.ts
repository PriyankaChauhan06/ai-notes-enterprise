import api from "./api";
import type {
  AnalyticsRange,
  AnalyticsSummary,
  AgentRun,
} from "../types/analytics";

export async function getAgentAnalytics(
  range?: AnalyticsRange,
): Promise<AnalyticsSummary> {
  const response = await api.get<{ success: boolean; data: AnalyticsSummary }>(
    "/ai/analytics",
    { params: range ? { range } : undefined },
  );

  return response.data.data;
}

export async function getAgentRuns(): Promise<AgentRun[]> {
  const response = await api.get<{
    success: boolean;
    data: Array<AgentRun & { _id: string }>;
  }>("/ai/runs");

  return response.data.data.map(({ _id, ...run }) => ({ ...run, id: _id }));
}
