import type { Request, Response } from "express";
import { askWithRAG } from "../services/rag.service";

export async function askRAGController(req: Request, res: Response) {
  const result = await askWithRAG({
    userId: req.userId,
    question: req.body.question,
  });

  const { answer, sources } = result;
  res.json({ success: true, data: { answer, sources } });
}
