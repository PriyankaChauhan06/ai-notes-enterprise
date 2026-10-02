import { createClient } from "redis";
import { logger } from "../utils/logger";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) throw new Error("REDIS_URL is not configured");

export const redisClient = createClient({ url: redisUrl });

redisClient.on("error", (error) => {
  logger.error("Redis error", error);
});

export async function connectRedis() {
  await redisClient.connect();
  logger.info("Redis connected");
}
