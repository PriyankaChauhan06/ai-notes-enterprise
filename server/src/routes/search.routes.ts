import { Router } from "express";
import { semanticSearchController } from "../controllers/search.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { asyncHandler } from "../utils/async-handler";
import { semanticSearchSchema } from "../utils/validation/ai.validation";

const router = Router();

router.use(authenticate);

router.post(
  "/semantic",
  validate(semanticSearchSchema),
  asyncHandler(semanticSearchController),
);

export default router;
