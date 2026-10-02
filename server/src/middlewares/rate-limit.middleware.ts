import type { NextFunction, Request, Response } from "express";
import { redisClient } from "../config/redis";
import { logger } from "../utils/logger";

const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 10;

export async function aiRateLimit(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const key = `ai:rate-limit:${userId}`;

  try {
    const currentCount = await redisClient.incr(key);

    if (currentCount === 1) {
      await redisClient.expire(key, WINDOW_SECONDS);
    }

    if (currentCount > MAX_REQUESTS) {
      return res.status(429).json({
        success: false,
        message: "Too many AI requests. Please try again later.",
      });
    }

    next();
  } catch (error) {
    logger.error("AI rate limiter error:", error);

    return res.status(503).json({
      success: false,
      message: "AI service is temporarily unavailable. Please try again later.",
    });
  }
}
