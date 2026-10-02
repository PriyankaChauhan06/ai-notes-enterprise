import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import useAgentAnalytics from "../src/hooks/useAgentAnalytics";
import { getAgentAnalytics } from "../src/services/analytics.service";

vi.mock("../src/services/analytics.service", () => ({
  getAgentAnalytics: vi.fn(),
}));

const mockedGetAgentAnalytics = vi.mocked(getAgentAnalytics);

const mockAnalytics = {
  totalRuns: 10,
  successfulRuns: 8,
  failedRuns: 2,
  totalInputTokens: 1000,
  totalOutputTokens: 500,
  totalTokens: 1500,
  totalEstimatedCost: 0.00125,
  averageDurationMs: 250,

  totalToolCalls: 15,

  toolUsage: {
    search_my_notes: 8,
    get_note: 4,
    create_note: 2,
    update_note: 1,
    delete_note: 0,
  },
};

describe("useAgentAnalytics", () => {
  it("has the correct initial state", () => {
    const { result } = renderHook(() => useAgentAnalytics());

    expect(result.current.analytics).toBeNull();
    expect(result.current.analyticsRange).toBeUndefined();
    expect(result.current.isAnalyticsLoading).toBe(false);
  });

  it("loads analytics and stores the result", async () => {
    mockedGetAgentAnalytics.mockResolvedValueOnce(mockAnalytics);

    const { result } = renderHook(() => useAgentAnalytics());

    await act(async () => {
      await result.current.loadAnalytics();
    });

    expect(mockedGetAgentAnalytics).toHaveBeenCalledWith(undefined);
    expect(result.current.analytics).toEqual(mockAnalytics);
    expect(result.current.isAnalyticsLoading).toBe(false);
  });

  it("loads analytics for the selected range", async () => {
    mockedGetAgentAnalytics.mockResolvedValueOnce(mockAnalytics);

    const { result } = renderHook(() => useAgentAnalytics());

    await act(async () => {
      result.current.setAnalyticsRange("7d");
      await result.current.loadAnalytics("7d");
    });

    expect(result.current.analyticsRange).toBe("7d");
    expect(mockedGetAgentAnalytics).toHaveBeenCalledWith("7d");
    expect(result.current.analytics).toEqual(mockAnalytics);
  });

  it("sets loading state while analytics are loading", async () => {
    let resolveRequest!: (value: typeof mockAnalytics) => void;

    mockedGetAgentAnalytics.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );

    const { result } = renderHook(() => useAgentAnalytics());

    let requestPromise: Promise<unknown>;

    act(() => {
      requestPromise = result.current.loadAnalytics();
    });

    expect(result.current.isAnalyticsLoading).toBe(true);

    await act(async () => {
      resolveRequest(mockAnalytics);
      await requestPromise;
    });

    expect(result.current.isAnalyticsLoading).toBe(false);
    expect(result.current.analytics).toEqual(mockAnalytics);
  });

  it("handles analytics API errors", async () => {
    mockedGetAgentAnalytics.mockRejectedValueOnce(new Error("API failed"));

    const { result } = renderHook(() => useAgentAnalytics());

    await act(async () => {
      await result.current.loadAnalytics();
    });

    expect(result.current.analytics).toBeNull();
    expect(result.current.analyticsError).toBe("Failed to load analytics.");
    expect(result.current.isAnalyticsLoading).toBe(false);
  });

  it("changes the analytics range and reloads analytics", async () => {
    mockedGetAgentAnalytics.mockResolvedValueOnce(mockAnalytics);

    const { result } = renderHook(() => useAgentAnalytics());

    await act(async () => {
      await result.current.changeAnalyticsRange("30d");
    });

    expect(result.current.analyticsRange).toBe("30d");
    expect(mockedGetAgentAnalytics).toHaveBeenCalledWith("30d");
    expect(result.current.analytics).toEqual(mockAnalytics);
  });
});
