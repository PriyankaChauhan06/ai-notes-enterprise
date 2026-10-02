import { describe, expect, it, vi, beforeEach } from "vitest";
import { getAgentAnalyticsController } from "../../src/controllers/ai.controller";
import { getAgentAnalytics } from "../../src/services/agent-analytics.service";

const TestUserId: string = "507f1f77bcf86cd799439011";

vi.mock("../../src/services/ai.service", () => ({
  generateAI: vi.fn(),
}));

vi.mock("../../src/services/agent.service", () => ({
  runAgent: vi.fn(),
}));

vi.mock("../../src/services/agent-analytics.service", () => ({
  getAgentAnalytics: vi.fn(),
}));

const mockedGetAgentAnalytics = vi.mocked(getAgentAnalytics);

describe("getAgentAnalyticsController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns analytics for the authenticated user", async () => {
    const analytics = {
      totalRuns: 10,
      successfulRuns: 8,
      failedRuns: 2,
      totalInputTokens: 10_000,
      totalOutputTokens: 2_000,
      totalTokens: 12_000,
      totalEstimatedCost: 4.25,
      averageDurationMs: 1500,
    };

    mockedGetAgentAnalytics.mockResolvedValueOnce(analytics);

    const req = {
      userId: TestUserId,
      query: {},
    } as any;

    const json = vi.fn();

    const res = {
      status: vi.fn().mockReturnValue({ json }),
    } as any;

    await getAgentAnalyticsController(req, res);

    expect(mockedGetAgentAnalytics).toHaveBeenCalledWith(req.userId, undefined);

    expect(res.status).toHaveBeenCalledWith(200);

    expect(json).toHaveBeenCalledWith({
      success: true,
      data: analytics,
    });
  });

  it("passes the requested analytics range to the service", async () => {
    const analytics = {
      totalRuns: 5,
      successfulRuns: 4,
      failedRuns: 1,
      totalInputTokens: 5_000,
      totalOutputTokens: 1_000,
      totalTokens: 6_000,
      totalEstimatedCost: 2.125,
      averageDurationMs: 1200,
    };

    mockedGetAgentAnalytics.mockResolvedValueOnce(analytics);

    const req = {
      userId: TestUserId,
      query: {
        range: "7d",
      },
    } as any;

    const json = vi.fn();

    const res = {
      status: vi.fn().mockReturnValue({ json }),
    } as any;

    await getAgentAnalyticsController(req, res);

    expect(mockedGetAgentAnalytics).toHaveBeenCalledWith(req.userId, "7d");

    expect(res.status).toHaveBeenCalledWith(200);

    expect(json).toHaveBeenCalledWith({
      success: true,
      data: analytics,
    });
  });

  it("passes the today range to the service", async () => {
    const analytics = {
      totalRuns: 3,
      successfulRuns: 3,
      failedRuns: 0,
      totalInputTokens: 3_000,
      totalOutputTokens: 500,
      totalTokens: 3_500,
      totalEstimatedCost: 1.075,
      averageDurationMs: 900,
    };

    mockedGetAgentAnalytics.mockResolvedValueOnce(analytics);

    const req = {
      userId: TestUserId,
      query: {
        range: "today",
      },
    } as any;

    const json = vi.fn();

    const res = {
      status: vi.fn().mockReturnValue({ json }),
    } as any;

    await getAgentAnalyticsController(req, res);

    expect(mockedGetAgentAnalytics).toHaveBeenCalledWith(req.userId, "today");
  });
});
