import { describe, expect, it, vi, beforeEach } from "vitest";
import AgentRun from "../../src/models/AgentRun";
import { getAgentAnalytics } from "../../src/services/agent-analytics.service";

const TestUserId: string = "507f1f77bcf86cd799439011";

vi.mock("../../src/models/AgentRun", () => ({
  default: { aggregate: vi.fn() },
}));

const mockedAggregate = vi.mocked(AgentRun.aggregate);

describe("getAgentAnalytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns agent analytics for a user", async () => {
    const analytics = {
      totalRuns: 10,
      successfulRuns: 8,
      failedRuns: 2,
      totalInputTokens: 10_000,
      totalOutputTokens: 2_000,
      totalTokens: 12_000,
      totalEstimatedCost: 4.25,
      averageDurationMs: 1500,
      totalToolCalls: 15,

      toolUsage: {
        search_my_notes: 8,
        get_note: 4,
        create_note: 2,
        update_note: 1,
        delete_note: 0,
      },
    };

    mockedAggregate.mockResolvedValueOnce([
      {
        summary: [
          {
            totalRuns: 10,
            successfulRuns: 8,
            failedRuns: 2,
            totalInputTokens: 10000,
            totalOutputTokens: 2000,
            totalTokens: 12000,
            totalEstimatedCost: 4.25,
            averageDurationMs: 1500,
            totalToolCalls: 15,
          },
        ],
        tools: [
          { _id: "search_my_notes", count: 8 },
          { _id: "get_note", count: 4 },
          { _id: "create_note", count: 2 },
          { _id: "update_note", count: 1 },
        ],
      },
    ]);

    const result = await getAgentAnalytics(TestUserId);

    expect(result).toEqual(analytics);

    expect(mockedAggregate).toHaveBeenCalledTimes(1);

    const pipeline = mockedAggregate.mock.calls[0][0] as any[];

    expect(pipeline[0]).toEqual({ $match: { userId: expect.anything() } });
  });

  it("returns zero values when the user has no agent runs", async () => {
    mockedAggregate.mockResolvedValueOnce([]);

    const result = await getAgentAnalytics(TestUserId);

    expect(result).toEqual({
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalTokens: 0,
      totalEstimatedCost: 0,
      averageDurationMs: 0,
      totalToolCalls: 0,

      toolUsage: {
        search_my_notes: 0,
        get_note: 0,
        create_note: 0,
        update_note: 0,
        delete_note: 0,
      },
    });
  });

  it("throws for an invalid user ID", async () => {
    await expect(getAgentAnalytics("invalid-user-id")).rejects.toThrow(
      "Invalid user ID",
    );

    expect(mockedAggregate).not.toHaveBeenCalled();
  });

  it("uses the authenticated user's ObjectId in the aggregation filter", async () => {
    mockedAggregate.mockResolvedValueOnce([
      {
        summary: [
          {
            totalRuns: 1,
            successfulRuns: 1,
            failedRuns: 0,
            totalInputTokens: 100,
            totalOutputTokens: 50,
            totalTokens: 150,
            totalEstimatedCost: 0.000125,
            averageDurationMs: 500,
            totalToolCalls: 0,
          },
        ],
        tools: [],
      },
    ] as any);

    await getAgentAnalytics(TestUserId);

    const pipeline = mockedAggregate.mock.calls[0][0] as any[];

    const matchedUserId = pipeline[0].$match.userId;

    expect(matchedUserId.toString()).toBe(TestUserId);
  });

  it("filters analytics by the last 7 days", async () => {
    vi.mocked(AgentRun.aggregate).mockResolvedValueOnce([]);

    await getAgentAnalytics(TestUserId, "7d");

    const aggregateMock = vi.mocked(AgentRun.aggregate);

    const pipeline = aggregateMock.mock.calls[0][0];

    const matchStage = pipeline[0] as {
      $match: { createdAt: { $gte: Date; $lte: Date } };
    };

    expect(
      matchStage.$match.createdAt.$lte.getTime() -
        matchStage.$match.createdAt.$gte.getTime(),
    ).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it("filters analytics by the last 30 days", async () => {
    vi.mocked(AgentRun.aggregate).mockResolvedValueOnce([]);

    await getAgentAnalytics(TestUserId, "30d");

    const aggregateMock = vi.mocked(AgentRun.aggregate);

    const pipeline = aggregateMock.mock.calls[0][0];

    const matchStage = pipeline[0] as {
      $match: { createdAt: { $gte: Date; $lte: Date } };
    };

    expect(
      matchStage.$match.createdAt.$lte.getTime() -
        matchStage.$match.createdAt.$gte.getTime(),
    ).toBe(30 * 24 * 60 * 60 * 1000);
  });

  it("filters analytics from the start of today", async () => {
    vi.mocked(AgentRun.aggregate).mockResolvedValueOnce([]);

    await getAgentAnalytics(TestUserId, "today");

    const aggregateMock = vi.mocked(AgentRun.aggregate);

    const pipeline = aggregateMock.mock.calls[0][0];

    const matchStage = pipeline[0] as {
      $match: { createdAt: { $gte: Date; $lte: Date } };
    };

    const startDate = matchStage.$match.createdAt.$gte;
    const endDate = matchStage.$match.createdAt.$lte;

    expect(startDate.getHours()).toBe(0);
    expect(startDate.getMinutes()).toBe(0);
    expect(startDate.getSeconds()).toBe(0);
    expect(startDate.getMilliseconds()).toBe(0);

    expect(startDate.getDate()).toBe(endDate.getDate());
    expect(startDate.getMonth()).toBe(endDate.getMonth());
    expect(startDate.getFullYear()).toBe(endDate.getFullYear());

    expect(endDate.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
    expect(endDate.getTime()).toBeLessThanOrEqual(Date.now());
  });

  it("throws for an invalid analytics range", async () => {
    await expect(getAgentAnalytics(TestUserId, "90d" as any)).rejects.toThrow(
      "Invalid analytics range",
    );

    expect(mockedAggregate).not.toHaveBeenCalled();
  });
});
