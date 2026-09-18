import type { Request, Response } from "express";
import { generateAI } from "../services/ai.service";

export async function generateAIController(req: Request, res: Response) {
  const result = await generateAI(req.body);
  res.json({ success: true, data: result });
}
