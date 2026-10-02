import { Types } from "mongoose";
import AgentRun from "../models/AgentRun";
import type { AnalyticsRange } from "../types/analytics";

export async function getAgentAnalytics(
  userId: string,
  range?: AnalyticsRange,
) {
  if (!Types.ObjectId.isValid(userId)) throw new Error("Invalid user ID");

  const userObjectId = new Types.ObjectId(userId);

  const matchStage: Record<string, unknown> = { userId: userObjectId };

  if (range) {
    const now = new Date();
    let startDate: Date;

    if (range === "today") {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === "7d") {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
    } else if (range === "30d") {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 30);
    } else {
      throw new Error("Invalid analytics range");
    }

    matchStage.createdAt = { $gte: startDate, $lte: now };
  }

  const [result] = await AgentRun.aggregate([
    { $match: matchStage },
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,

              totalRuns: { $sum: 1 },

              successfulRuns: {
                $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] },
              },

              failedRuns: {
                $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] },
              },

              totalInputTokens: { $sum: "$inputTokens" },
              totalOutputTokens: { $sum: "$outputTokens" },
              totalTokens: { $sum: "$totalTokens" },
              totalEstimatedCost: { $sum: "$estimatedCost" },

              averageDurationMs: { $avg: "$durationMs" },

              totalToolCalls: { $sum: { $size: "$toolCalls" } },
            },
          },

          {
            $project: {
              _id: 0,
              totalRuns: 1,
              successfulRuns: 1,
              failedRuns: 1,
              totalInputTokens: 1,
              totalOutputTokens: 1,
              totalTokens: 1,
              totalEstimatedCost: 1,
              averageDurationMs: 1,
              totalToolCalls: 1,
            },
          },
        ],
        tools: [
          { $unwind: "$toolCalls" },
          { $group: { _id: "$toolCalls.toolName", count: { $sum: 1 } } },
        ],
      },
    },
  ]);

  const summary = result?.summary?.[0];

  const toolUsage = {
    search_my_notes: 0,
    get_note: 0,
    create_note: 0,
    update_note: 0,
    delete_note: 0,
  };

  for (const tool of result?.tools ?? []) {
    if (tool._id in toolUsage) {
      toolUsage[tool._id as keyof typeof toolUsage] = tool.count;
    }
  }

  return {
    ...(summary ?? {
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalTokens: 0,
      totalEstimatedCost: 0,
      averageDurationMs: 0,
      totalToolCalls: 0,
    }),

    toolUsage,
  };
}
