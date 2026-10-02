import express, { Router } from "express";
import { describe, expect, it, vi } from "vitest";
import request from "supertest";

import { authenticate } from "../../src/middlewares/auth.middleware";
import { getAgentAnalyticsController } from "../../src/controllers/ai.controller";
import { asyncHandler } from "../../src/utils/async-handler";
import { getAgentAnalytics } from "../../src/services/agent-analytics.service";
import { validate } from "../../src/middlewares/validate.middleware";
import { analyticsRangeSchema } from "../../src/utils/validation/ai.validation";

const router = Router();

router.use(authenticate);

router.get(
  "/analytics",
  validate(analyticsRangeSchema, "query"),
  asyncHandler(getAgentAnalyticsController),
);
const testApp = express();

testApp.use(express.json());
testApp.use(router);

const TestUserId: string = "507f1f77bcf86cd799439011";

vi.mock("../../src/services/agent-analytics.service", () => ({
  getAgentAnalytics: vi.fn(),
}));

const mockedGetAgentAnalytics = vi.mocked(getAgentAnalytics);

describe("AI analytics route", () => {
  // unauthenticated -> 401
  it("rejects unauthenticated requests", async () => {
    const response = await request(testApp).get("/analytics");
    expect(response.status).toBe(401);
  });

  // authenticated + no range -> 200 + analytics, getAgentAnalytics(userId, undefined)
  it("returns analytics for an authenticated user", async () => {
    const analytics = {
      totalRuns: 5,
      successfulRuns: 4,
      failedRuns: 1,
      totalInputTokens: 5000,
      totalOutputTokens: 1000,
      totalTokens: 6000,
      totalEstimatedCost: 2.125,
      averageDurationMs: 1200,
    };

    mockedGetAgentAnalytics.mockResolvedValueOnce(analytics);

    // Test-only valid JWT.
    // User ID must be a valid MongoDB ObjectId.
    const jwt = await import("jsonwebtoken");

    const token = jwt.sign(
      { userId: TestUserId },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: "1h" },
    );

    const response = await request(testApp)
      .get("/analytics")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body).toEqual({ success: true, data: analytics });

    expect(mockedGetAgentAnalytics).toHaveBeenCalledWith(TestUserId, undefined);
  });

  // authenticated + range=7d -> 200 + analytics, getAgentAnalytics(userId, "7d")
  it("returns analytics for the requested range", async () => {
    const analytics = {
      totalRuns: 5,
      successfulRuns: 4,
      failedRuns: 1,
      totalInputTokens: 5000,
      totalOutputTokens: 1000,
      totalTokens: 6000,
      totalEstimatedCost: 2.125,
      averageDurationMs: 1200,
    };

    mockedGetAgentAnalytics.mockResolvedValueOnce(analytics);

    const jwt = await import("jsonwebtoken");

    const token = jwt.sign(
      { userId: TestUserId },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: "1h" },
    );

    const response = await request(testApp)
      .get("/analytics?range=7d")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body).toEqual({ success: true, data: analytics });

    expect(mockedGetAgentAnalytics).toHaveBeenCalledWith(TestUserId, "7d");
  });

  it("rejects an invalid analytics range", async () => {
    const jwt = await import("jsonwebtoken");

    const token = jwt.sign(
      { userId: TestUserId },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: "1h" },
    );

    const response = await request(testApp)
      .get("/analytics?range=90d")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);

    expect(mockedGetAgentAnalytics).not.toHaveBeenCalled();
  });
});
