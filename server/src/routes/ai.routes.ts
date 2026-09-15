import { Router } from "express";
import { generateAIController } from "../controllers/ai.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { asyncHandler } from "../utils/async-handler";
import { generateAISchema } from "../utils/validation/ai.validation";

const router = Router();

router.use(authenticate);

router.post(
  "/generate",
  validate(generateAISchema),
  asyncHandler(generateAIController),
);

export default router;
