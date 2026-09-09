import bcrypt from "bcryptjs";
import User from "../models/User";
import { AppError } from "../utils/app-error";
import { generateAccessToken } from "../utils/jwt";
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

export async function registerUser(data: RegisterData) {
  const existingUser = await User.findOne({
    email: data.email,
  });

  if (existingUser) throw new AppError("User already exists", 409);

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const user = await User.create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
  });

  return user;
}

export async function loginUser(data: LoginData) {
  const user = await User.findOne({
    email: data.email,
  }).select(hashPassword);
  if (!user) throw new AppError("Invalid email or password", 401);

  const isPasswordValid = await bcrypt.compare(data.password, user.password);
  if (!isPasswordValid) throw new AppError("Invalid email or password", 401);

  const accessToken = generateAccessToken(user._id.toString());

  return {
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  };
}
