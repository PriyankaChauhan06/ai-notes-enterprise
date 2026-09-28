import type { Request, Response } from "express";
import { generateAI } from "../services/ai.service";
import { runAgent } from "../services/agent.service";

export async function generateAIController(req: Request, res: Response) {
  const result = await generateAI(req.body);
  res.json({ success: true, data: result });
}

export async function agentAskController(req: Request, res: Response) {
  const result = await runAgent({
    userId: req.userId,
    question: req.body.question,
    conversationId: req.body.conversationId,
  });

  res.json({ success: true, data: result });
}
