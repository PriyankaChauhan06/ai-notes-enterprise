import { Router } from "express";
import mongoose from "mongoose";
import { redisClient } from "../config/redis";
import authRoutes from "./auth.routes";
import noteRoutes from "./note.routes";
import aiRoutes from "./ai.routes";
import searchRoutes from "./search.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/note", noteRoutes);
router.use("/ai", aiRoutes);
router.use("/search", searchRoutes);

router.get("/health", (_req, res) => {
  const isMongoHealthy = mongoose.connection.readyState === 1;
  const isRedisHealthy = redisClient.isReady;

  const isHealthy = isMongoHealthy && isRedisHealthy;

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    status: isHealthy ? "healthy" : "unhealthy",
    dependencies: {
      mongodb: isMongoHealthy ? "up" : "down",
      redis: isRedisHealthy ? "up" : "down",
    },
  });
});

export default router;
