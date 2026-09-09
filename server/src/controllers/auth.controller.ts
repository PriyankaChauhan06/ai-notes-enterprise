import type { Request, Response } from "express";
import { registerUser, loginUser } from "../services/auth.service";

export async function registerController(req: Request, res: Response) {
  const user = await registerUser(req.body);

  const { id, name, email } = user;
  res.status(201).json({ success: true, data: { id, name, email } });
}

export async function loginController(req: Request, res: Response) {
  const result = await loginUser(req.body);
  res.status(200).json({ success: true, data: result });
}

export async function loginSuccessfull(req: Request, res: Response) {
  res.status(200).json({ success: true, data: { userId: req.userId } });
}
