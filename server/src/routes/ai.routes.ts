import { Router } from "express";
import { getAIHistoryController } from "../controllers/ai-history.controller";
import {
  agentAskController,
  agentStreamController,
  generateAIController,
  getAgentAnalyticsController,
  getAgentRunsController,
} from "../controllers/ai.controller";
import { askRAGController } from "../controllers/rag.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { asyncHandler } from "../utils/async-handler";
import { aiRateLimit } from "../middlewares/rate-limit.middleware";
import {
  agentAskSchema,
  askRAGSchema,
  generateAISchema,
  analyticsRangeSchema,
} from "../utils/validation/ai.validation";

const router = Router();

router.use(authenticate);

router.post(
  "/generate",
  aiRateLimit,
  validate(generateAISchema),
  asyncHandler(generateAIController),
);

router.post(
  "/ask",
  aiRateLimit,
  validate(askRAGSchema),
  asyncHandler(askRAGController),
);

router.post(
  "/agent",
  aiRateLimit,
  validate(agentAskSchema),
  asyncHandler(agentAskController),
);

router.post(
  "/agent/stream",
  aiRateLimit,
  validate(agentAskSchema),
  asyncHandler(agentStreamController),
);

router.get("/history", asyncHandler(getAIHistoryController));

router.get(
  "/analytics",
  validate(analyticsRangeSchema, "query"),
  asyncHandler(getAgentAnalyticsController),
);

router.get("/runs", asyncHandler(getAgentRunsController));

export default router;
