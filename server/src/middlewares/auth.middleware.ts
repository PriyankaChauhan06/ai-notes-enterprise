import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/app-error";

const JWT_ACCESS_SECRET: any = process.env.JWT_ACCESS_SECRET;

if (!JWT_ACCESS_SECRET) throw new Error("JWT_ACCESS_SECRET is not configured");

interface JwtPayload {
  userId: string;
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;
  if (!authorization) throw new AppError("Authentication required", 401);

  const [scheme, token] = authorization.split(" ");
  if (scheme !== "Bearer" || !token)
    throw new AppError("Invalid authorization header", 401);

  try {
    const decoded: any = jwt.verify(token, JWT_ACCESS_SECRET) as JwtPayload;
    req.userId = decoded.userId;

    next();
  } catch {
    throw new AppError("Invalid or expired token", 401);
  }
}
