import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import User from "../models/User";
import { AppError } from "../utils/app-error";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { redisClient } from "../config/redis";
import { googleClient } from "../config/google";

const hashPassword: any = process.env.HASH_PWD;

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface GoogleUserData {
  credential: string;
}

export async function registerUser(data: RegisterData) {
  const existingUser = await User.findOne({
    email: data.email,
  });

  if (existingUser) {
    throw new AppError("User already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const { name, email } = data;
  const user = await User.create({ name, email, password: hashedPassword });
  return user;
}

export async function loginUser(data: LoginData) {
  const user: any = await User.findOne({ email: data.email }).select(
    hashPassword,
  );
  if (!user) throw new AppError("Invalid email or password", 401);

  const isPasswordValid = await bcrypt.compare(data.password, user.password);
  if (!isPasswordValid) throw new AppError("Invalid email or password", 401);

  const userId = user._id.toString();
  const sessionId = crypto.randomUUID();

  await redisClient.set(`refresh-session:${sessionId}`, userId, {
    EX: 7 * 24 * 60 * 60,
  });

  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId, sessionId);

  const { _id, name, email } = user;
  return {
    accessToken,
    refreshToken,
    user: { id: _id, name, email },
  };
}

export async function loginWithGoogle(data: GoogleUserData) {
  const ticket = await googleClient.verifyIdToken({
    idToken: data.credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload) throw new AppError("Invalid Google credential", 401);

  const googleId = payload.sub;
  const email = payload.email;
  const name = payload.name;

  if (!googleId || !email) {
    throw new AppError("Google account information is incomplete", 401);
  }

  let user = await User.findOne({ googleId });

  if (!user) {
    user = await User.findOne({ email });

    if (user) {
      user.googleId = googleId;
      await user.save();
    } else {
      user = await User.create({
        name: name || email.split("@")[0],
        email,
        googleId,
      });
    }
  }

  const userId = user._id.toString();

  const sessionId = crypto.randomUUID();

  await redisClient.set(`refresh-session:${sessionId}`, userId, {
    EX: 7 * 24 * 60 * 60,
  });

  const accessToken = generateAccessToken(userId);

  const refreshToken = generateRefreshToken(userId, sessionId);

  return {
    accessToken,
    refreshToken,
    user: { id: user._id, name: user.name, email: user.email },
  };
}
