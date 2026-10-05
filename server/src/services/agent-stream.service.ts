import { openai } from "../config/ai";
import { AIModel } from "../config/ai-model";
import { agentTools } from "../ai/tool";
import { validateToolAccess } from "../ai/guardrail";
import { executeTool } from "../ai/executor";
import { calculateModelCost } from "../ai/model-pricing";
import { AppError } from "../utils/app-error";
import {
  AGENT_INSTRUCTIONS,
  getOrCreateAgentConversation,
  buildAgentInput,
  saveStreamConversation,
} from "./agent-context.service";
import { recordAgentRun } from "./agent-run.service";
import type { StreamAgentData } from "../types/agent-stream";
import type { ToolCallLog } from "../types/agent";
import type { ToolRisk } from "../ai/tool-risk";

const MAX_AGENT_TURNS = 5;
const MAX_AGENT_TOOL_CALLS = 10;

const agentStartTime = Date.now();

const usage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };

const toolCallLogs: ToolCallLog[] = [];

export async function streamAgent({
  userId,
  question,
  conversationId,
  onEvent,
}: StreamAgentData) {
  const conversation = await getOrCreateAgentConversation(
    userId,
    conversationId,
  );

  const input = buildAgentInput(conversation, question);

  let toolCallCount = 0;
  let fullText = "";

  for (let turn = 0; turn < MAX_AGENT_TURNS; turn++) {
    const stream = await openai.responses.create({
      model: AIModel,
      instructions: AGENT_INSTRUCTIONS,
      tools: agentTools,
      input,
      max_output_tokens: 1000,
      stream: true,
    });

    const outputItems: any[] = [];

    for await (const event of stream) {
      if (event.type === "response.output_text.delta") {
        fullText += event.delta;
        onEvent({ type: "text", text: event.delta });
      }

      if (event.type === "response.completed") {
        const responseUsage = event.response.usage;

        if (responseUsage) {
          usage.inputTokens += responseUsage.input_tokens ?? 0;
          usage.outputTokens += responseUsage.output_tokens ?? 0;
          usage.totalTokens += responseUsage.total_tokens ?? 0;
        }
      }

      if (event.type === "response.output_item.done") {
        outputItems.push(event.item);
      }
    }

    input.push(...outputItems);

    const toolCalls = outputItems.filter(
      (item) => item.type === "function_call",
    );

    if (toolCalls.length === 0) {
      await saveStreamConversation(conversation, question, fullText);

      const estimatedCost = calculateModelCost(
        AIModel,
        usage.inputTokens,
        usage.outputTokens,
      );

      await recordAgentRun({
        userId,
        conversationId: conversation._id.toString(),
        question,
        model: AIModel,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalTokens: usage.totalTokens,
        estimatedCost,
        status: "success",
        durationMs: Date.now() - agentStartTime,
        toolCalls: [],
      });

      onEvent({ type: "done", conversationId: conversation._id.toString() });

      return fullText;
    }
    for (const toolCall of toolCalls) {
      toolCallCount += 1;

      if (toolCallCount > MAX_AGENT_TOOL_CALLS) {
        throw new AppError("AI agent reached its maximum tool-call limit", 503);
      }

      validateToolAccess(toolCall.name);

      const toolStartTime = Date.now();
      const risk = validateToolAccess(toolCall.name);

      onEvent({ type: "tool_start", toolName: toolCall.name });

      try {
        const args = JSON.parse(toolCall.arguments);

        const result = await executeTool(toolCall.name, userId, args);

        input.push({
          type: "function_call_output",
          call_id: toolCall.call_id,
          output: JSON.stringify(result),
        });

        toolCallLogs.push({
          toolName: toolCall.name,
          risk,
          durationMs: Date.now() - toolStartTime,
          success: true,
        });

        onEvent({
          type: "tool_result",
          toolName: toolCall.name,
          success: true,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Tool execution failed";

        input.push({
          type: "function_call_output",
          call_id: toolCall.call_id,
          output: JSON.stringify({
            error: errorMessage,
          }),
        });

        toolCallLogs.push({
          toolName: toolCall.name,
          risk,
          durationMs: Date.now() - toolStartTime,
          success: false,
          error: errorMessage,
        });

        onEvent({
          type: "tool_result",
          toolName: toolCall.name,
          success: false,
        });
      }
    }
  }

  throw new AppError("AI agent reached its maximum tool-call limit", 503);
}
