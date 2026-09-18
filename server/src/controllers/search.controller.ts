import type { Request, Response } from "express";
import { semanticSearch } from "../services/search.service";

export async function semanticSearchController(req: Request, res: Response) {
  const results = await semanticSearch({
    userId: req.userId,
    query: req.body.query,
  });

  res.json({ success: true, data: results });
}
