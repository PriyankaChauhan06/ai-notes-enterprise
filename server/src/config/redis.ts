import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) throw new Error("REDIS_URL is not configured");

export const redisClient = createClient({ url: redisUrl });

redisClient.on("error", (error) => {
  console.error("Redis error:", error);
});

export async function connectRedis() {
  await redisClient.connect();
  console.log("Redis connected");
}
