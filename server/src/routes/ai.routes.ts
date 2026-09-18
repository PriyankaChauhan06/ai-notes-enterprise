import { Router } from "express";
import { getAIHistoryController } from "../controllers/ai-history.controller";
import { generateAIController } from "../controllers/ai.controller";
import { askRAGController } from "../controllers/rag.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { asyncHandler } from "../utils/async-handler";
import {
  askRAGSchema,
  generateAISchema,
} from "../utils/validation/ai.validation";

const router = Router();

router.use(authenticate);

router.post(
  "/generate",
  validate(generateAISchema),
  asyncHandler(generateAIController),
);

router.post("/ask", validate(askRAGSchema), asyncHandler(askRAGController));

router.get("/history", asyncHandler(getAIHistoryController));

export default router;
