import type { Request, Response } from "express";

import { getAIHistory } from "../services/ai-history.service";

export async function getAIHistoryController(req: Request, res: Response) {
  const conversations = await getAIHistory(req.userId);
  res.json({ success: true, data: conversations });
}
