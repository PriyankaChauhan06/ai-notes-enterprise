import { Router } from "express";
import {
  registerController,
  loginController,
  loginSuccessfull,
  refreshTokenController,
  logoutController,
  googleCallbackController,
  getCurrentUserController,
  googleLoginController,
} from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  googleLoginSchema,
  loginSchema,
  registerSchema,
} from "../utils/validation/auth.validation";
import { asyncHandler } from "../utils/async-handler";
import passport from "../config/passport";

const router = Router();

router.post(
  "/register",
  validate(registerSchema),
  asyncHandler(registerController),
);

router.post("/login", validate(loginSchema), asyncHandler(loginController));

router.get("/me", authenticate, asyncHandler(getCurrentUserController));

router.post("/refresh", asyncHandler(refreshTokenController));

router.post("/logout", asyncHandler(logoutController));

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  asyncHandler(googleCallbackController),
);

router.post(
  "/google",
  validate(googleLoginSchema),
  asyncHandler(googleLoginController),
);

export default router;
