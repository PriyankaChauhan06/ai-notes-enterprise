import { Router } from "express";
import {
  registerController,
  loginController,
  loginSuccessfull,
} from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  loginSchema,
  registerSchema,
} from "../utils/validation/auth.validation";
import { asyncHandler } from "../utils/async-handler";

const router = Router();

router.post(
  "/register",
  validate(registerSchema),
  asyncHandler(registerController),
);

router.post("/login", validate(loginSchema), asyncHandler(loginController));

router.get("/me", authenticate, asyncHandler(loginSuccessfull));

export default router;
