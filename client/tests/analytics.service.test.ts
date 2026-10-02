import { describe, expect, it, vi } from "vitest";
import api from "../src/services/api";
import { getAgentAnalytics } from "../src/services/analytics.service";

const analyticsURL = "/ai/analytics";

vi.mock("../src/services/api", () => ({ default: { get: vi.fn() } }));

const mockedGet = vi.mocked(api.get);

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

describe("getAgentAnalytics", () => {
  it("fetches all-time analytics", async () => {
    mockedGet.mockResolvedValueOnce({
      data: { success: true, data: mockAnalytics },
    });
    const result = await getAgentAnalytics();
    expect(mockedGet).toHaveBeenCalledWith(analyticsURL, { params: undefined });
    expect(result).toEqual(mockAnalytics);
  });

  it("fetches analytics for the requested range", async () => {
    mockedGet.mockResolvedValueOnce({
      data: { success: true, data: mockAnalytics },
    });
    const result = await getAgentAnalytics("7d");
    expect(mockedGet).toHaveBeenCalledWith(analyticsURL, {
      params: { range: "7d" },
    });
    expect(result).toEqual(mockAnalytics);
  });
});
