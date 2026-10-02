import { useState } from "react";
import { getAgentAnalytics } from "../services/analytics.service";
import type { AnalyticsRange, AnalyticsSummary } from "../types/analytics";

function useAgentAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  const [analyticsRange, setAnalyticsRange] = useState<
    AnalyticsRange | undefined
  >();

  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState("");

  const loadAnalytics = async (range?: AnalyticsRange) => {
    try {
      setIsAnalyticsLoading(true);
      setAnalyticsError("");

      const result = await getAgentAnalytics(range);

      setAnalytics(result);
    } catch (error) {
      console.error("Failed to load analytics:", error);
      setAnalyticsError("Failed to load analytics.");
    } finally {
      setIsAnalyticsLoading(false);
    }
  };

  const changeAnalyticsRange = async (range?: AnalyticsRange) => {
    setAnalyticsRange(range);
    await loadAnalytics(range);
  };

  return {
    analytics,
    analyticsRange,
    setAnalyticsRange,
    isAnalyticsLoading,
    analyticsError,
    loadAnalytics,
    changeAnalyticsRange,
  };
}

export default useAgentAnalytics;
