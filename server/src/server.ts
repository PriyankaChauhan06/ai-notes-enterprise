import "dotenv/config";
import mongoose from "mongoose";
import type { Server } from "http";
import app from "./app";
import { connectDB } from "./config/db";
import { connectRedis, redisClient } from "./config/redis";
import { logger } from "./utils/logger";

const PORT = process.env.PORT || 5000;

let server: Server;

async function startServer() {
  await connectDB();
  await connectRedis();

  server = app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
  });
}

async function gracefulShutdown(signal: string) {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  try {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    }

    if (redisClient.isOpen) {
      await redisClient.quit();
    }

    await mongoose.connection.close();

    logger.info("Graceful shutdown completed");

    process.exit(0);
  } catch (error) {
    logger.error("Error during graceful shutdown", error);

    process.exit(1);
  }
}

process.on("SIGTERM", () => {
  void gracefulShutdown("SIGTERM");
});

process.on("SIGINT", () => {
  void gracefulShutdown("SIGINT");
});

startServer().catch((error) => {
  logger.error("Failed to start server", error);
  process.exit(1);
});
