import jwt from "jsonwebtoken";
import type { StringValue } from "ms";

const JWT_ACCESS_SECRET: any = process.env.JWT_ACCESS_SECRET;

if (!JWT_ACCESS_SECRET) {
  throw new Error("JWT_ACCESS_SECRET is not configured");
}

export function generateAccessToken(userId: string) {
  const expiresIn = (process.env.JWT_ACCESS_EXPIRES_IN as StringValue) || "15m";

  return jwt.sign({ userId }, JWT_ACCESS_SECRET, { expiresIn });
}
