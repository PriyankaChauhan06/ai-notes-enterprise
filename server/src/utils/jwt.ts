import jwt from "jsonwebtoken";

const JWT_ACCESS_SECRET: any = process.env.JWT_ACCESS_SECRET;
const JWT_ACCESS_EXPIRES_IN: any = process.env.JWT_ACCESS_EXPIRES_IN;

const JWT_REFRESH_SECRET: any = process.env.JWT_REFRESH_SECRET;
const JWT_REFRESH_EXPIRES_IN: any = process.env.JWT_REFRESH_EXPIRES_IN;

if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error("JWT secrets are not configured");
}

export function generateAccessToken(userId: string) {
  return jwt.sign({ userId }, JWT_ACCESS_SECRET, { expiresIn: JWT_ACCESS_EXPIRES_IN });
}

export function generateRefreshToken(userId: string, sessionId: string) {
  return jwt.sign({ userId, sessionId }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, JWT_REFRESH_SECRET) as {
    userId: string;
    sessionId: string;
  };
}
