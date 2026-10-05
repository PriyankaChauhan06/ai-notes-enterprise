import { Types } from "mongoose";
import { openai } from "../config/ai";
import { AIModel } from "../config/ai-model";
import { agentTools } from "../ai/tool";
import { executeTool } from "../ai/executor";
import { AppError } from "../utils/app-error";
import { AgentContext, RunAgentData, ToolCallLog } from "../types/agent";
import type { ToolRisk } from "../ai/tool-risk";
import { validateToolAccess } from "../ai/guardrail";
import AIConversation from "../models/AIConversation";
import { validateCreateIntent } from "../ai/action-guard";
import { recordAgentRun } from "./agent-run.service";
import { calculateModelCost } from "../ai/model-pricing";
import { deleteNote, getNoteById, updateNote } from "./note.service";
import { logger } from "../utils/logger";
import {
  getOrCreateAgentConversation,
  buildAgentInput,
} from "./agent-context.service";

function addToolLog(
  context: AgentContext,
  data: {
    toolName: string;
    risk: ToolRisk;
    startTime: number;
    success: boolean;
    error?: string;
  },
) {
  context.toolCallLogs.push({
    toolName: data.toolName,
    risk: data.risk,
    durationMs: Date.now() - data.startTime,
    success: data.success,
    ...(data.error && {
      error: data.error,
    }),
  });
}

async function recordRun(
  context: AgentContext,
  status: "success" | "failed",
  error?: unknown,
) {
  // One agent request should create only one AgentRun.
  if (!context.conversation?._id || context.hasRecordedRun) return;

  context.hasRecordedRun = true;

  const estimatedCost = calculateModelCost(
    AIModel,
    context.usage.inputTokens,
    context.usage.outputTokens,
  );

  const errorMessage =
    error instanceof Error
      ? error.message
      : error
        ? "Agent execution failed"
        : undefined;

  await recordAgentRun({
    userId: context.userId,
    conversationId: context.conversation._id.toString(),
    question: context.question,
    model: AIModel,
    inputTokens: context.usage.inputTokens,
    outputTokens: context.usage.outputTokens,
    totalTokens: context.usage.totalTokens,
    estimatedCost,
    status,
    durationMs: Date.now() - context.agentStartTime,
    toolCalls: context.toolCallLogs,
    ...(errorMessage ? { error: errorMessage } : {}),
  });
}

export async function handleDeleteTool(
  context: AgentContext,
  toolCall: any,
  risk: ToolRisk,
) {
  const { conversation, question, userId } = context;

  const args = JSON.parse(toolCall.arguments);

  const noteId = args.noteId;

  if (!Types.ObjectId.isValid(noteId)) throw new Error("Invalid note ID");

  const actionStartTime = Date.now();

  conversation.pendingAction = { actionType: "delete_note", noteId };

  try {
    //  We only READ the note here. Actual deletion happens after user confirmation.
    const result: any = await executeTool("get_note", userId, { noteId });

    addToolLog(context, {
      toolName: "delete_note",
      risk,
      startTime: actionStartTime,
      success: true,
    });

    const confirmationAnswer =
      `I found the note "${result.title}". ` +
      `Are you sure you want to delete it? Please reply with Yes or No.`;

    conversation.messages.push(
      { role: "user", content: question, noteId },
      { role: "assistant", content: confirmationAnswer, noteId },
    );

    await conversation.save();
    await recordRun(context, "success");
    return {
      conversationId: conversation._id.toString(),
      answer: confirmationAnswer,
      pendingAction: conversation.pendingAction,
    };
  } catch (error) {
    addToolLog(context, {
      toolName: "delete_note",
      risk,
      startTime: actionStartTime,
      success: false,
      error:
        error instanceof Error ? error.message : "Delete preparation failed",
    });
    conversation.pendingAction = undefined;
    await conversation.save();
    await recordRun(context, "failed", error);
    throw error;
  }
}
