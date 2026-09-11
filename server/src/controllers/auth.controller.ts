import type { Request, Response } from "express";
import {
  registerUser,
  loginUser,
  loginWithGoogle,
} from "../services/auth.service";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { AppError } from "../utils/app-error";
import { redisClient } from "../config/redis";
import User from "../models/User";

export async function registerController(req: Request, res: Response) {
  const user = await registerUser(req.body);

  const { id, name, email } = user;
  res.status(201).json({ success: true, data: { id, name, email } });
}

export async function loginController(req: Request, res: Response) {
  const result = await loginUser(req.body);

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    data: {
      accessToken: result.accessToken,
      user: result.user,
    },
  });
}

export async function loginSuccessfull(req: Request, res: Response) {
  res.status(200).json({ success: true, data: { userId: req.userId } });
}

export async function refreshTokenController(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) throw new AppError("Refresh token not found", 401);

  try {
    const { userId, sessionId } = verifyRefreshToken(refreshToken);
    const storedUserId = await redisClient.get(`refresh-session:${sessionId}`);
    if (!storedUserId || storedUserId !== userId) {
      throw new AppError("Refresh session is no longer valid", 401);
    }

    const accessToken = generateAccessToken(userId);

    res.json({ success: true, data: { accessToken } });
  } catch {
    throw new AppError("Invalid or expired refresh token", 401);
  }
}

export async function logoutController(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    try {
      const { sessionId } = verifyRefreshToken(refreshToken);
      await redisClient.del(`refresh-session:${sessionId}`);
    } catch {
      // Token already invalid/expired.
      // We still clear the cookie.
    }
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
}

export async function getCurrentUserController(req: Request, res: Response) {
  const user = await User.findById(req.userId);

  if (!user) throw new AppError("User not found", 404);

  res.json({
    success: true,
    data: { id: user._id, name: user.name, email: user.email },
  });
}

export async function googleCallbackController(req: Request, res: Response) {
  const user = req.user as { _id: string; name: string; email: string };

  const userId = user._id.toString();

  const sessionId = crypto.randomUUID();

  await redisClient.set(`refresh-session:${sessionId}`, userId, {
    EX: 7 * 24 * 60 * 60,
  });

  const accessToken = generateAccessToken(userId);

  const refreshToken = generateRefreshToken(userId, sessionId);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.redirect(`${process.env.CLIENT_URL}/oauth/callback?token=${accessToken}`);
}

export async function googleLoginController(req: Request, res: Response) {
  const result = await loginWithGoogle(req.body);

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    data: { accessToken: result.accessToken, user: result.user },
  });
}
