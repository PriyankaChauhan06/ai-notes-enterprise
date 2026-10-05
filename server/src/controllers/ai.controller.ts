import type { Request, Response } from "express";
import { generateAI } from "../services/ai.service";
import { runAgent } from "../services/agent.service";
import { getAgentAnalytics } from "../services/agent-analytics.service";
import type { AnalyticsRange } from "../types/analytics";
import { getAgentRuns } from "../services/agent-run.service";
import { streamAgent } from "../services/agent-stream.service";

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

export async function getAgentAnalyticsController(req: Request, res: Response) {
  const range =
    typeof req.query.range === "string" ? req.query.range : undefined;

  const analytics = await getAgentAnalytics(
    req.userId,
    range as AnalyticsRange | undefined,
  );

  res.status(200).json({ success: true, data: analytics });
}

export async function getAgentRunsController(req: Request, res: Response) {
  const runs = await getAgentRuns(req.userId, 20);
  res.status(200).json({ success: true, data: runs });
}

export async function agentStreamController(req: Request, res: Response) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.flushHeaders();

  try {
    await streamAgent({
      userId: req.userId,
      question: req.body.question,
      conversationId: req.body.conversationId,
      onEvent: (event) => {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      },
    });

    res.end();
  } catch (error) {
    res.write(
      `data: ${JSON.stringify({ type: "error", message: error instanceof Error ? error.message : "Streaming failed" })}\n\n`,
    );

    res.end();
  }
}
