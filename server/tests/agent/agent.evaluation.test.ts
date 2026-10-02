import { beforeEach, describe, expect, it, vi } from "vitest";

import { recordAgentRun } from "../../src/services/agent-run.service";
import { runAgent } from "../../src/services/agent.service";
import AIConversation from "../../src/models/AIConversation";
import { openai } from "../../src/config/ai";
import { executeTool } from "../../src/ai/executor";

const userId = "507f1f77bcf86cd799439011";
const conversationId = "507f1f77bcf86cd799439099";

vi.mock("../../src/config/ai", () => ({
  openai: {
    responses: {
      create: vi.fn(),
    },
  },
}));

vi.mock("../../src/ai/executor", () => ({
  executeTool: vi.fn(),
}));

vi.mock("../../src/models/AIConversation", () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("../../src/services/agent-run.service", () => ({
  recordAgentRun: vi.fn().mockResolvedValue(undefined),
}));

const mockedOpenAI = vi.mocked(openai.responses.create);
const mockedExecuteTool = vi.mocked(executeTool);
const mockedAIConversation = vi.mocked(AIConversation);

function createMockConversation() {
  return {
    _id: conversationId,
    userId,
    messages: [],
    pendingAction: undefined,
    save: vi.fn().mockResolvedValue(undefined),
  };
}

describe("Agent Evaluation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("executes a READ tool automatically", async () => {
    const conversation = createMockConversation();

    mockedAIConversation.findOne.mockResolvedValue(conversation as any);

    mockedOpenAI
      .mockResolvedValueOnce({
        output: [
          {
            type: "function_call",
            name: "search_my_notes",
            call_id: "search_123",
            arguments: JSON.stringify({
              query: "React",
            }),
          },
        ],
        output_text: "",
      } as any)
      .mockResolvedValueOnce({
        output: [],
        output_text: "I found your React notes.",
      } as any);

    mockedExecuteTool.mockResolvedValueOnce([
      {
        noteId: "507f1f77bcf86cd799439012",
        content: "React is a JavaScript library.",
      },
    ]);

    const result = await runAgent({
      userId,
      question: "Find my React notes",
      conversationId,
    });

    expect(mockedExecuteTool).toHaveBeenCalledWith("search_my_notes", userId, {
      query: "React",
    });

    expect(result.answer).toBe("I found your React notes.");
  });

  it("blocks create_note when user did not explicitly request creation", async () => {
    const conversation = createMockConversation();

    mockedAIConversation.findOne.mockResolvedValue(conversation as any);

    mockedOpenAI.mockResolvedValueOnce({
      output: [
        {
          type: "function_call",
          name: "create_note",
          call_id: "create_123",
          arguments: JSON.stringify({
            title: "JavaScript Closures",
            description: "Explanation of closures",
            category: "JavaScript",
            tags: ["javascript"],
          }),
        },
      ],
      output_text: "",
    } as any);

    await expect(
      runAgent({
        userId,
        question: "Explain JavaScript closures",
        conversationId,
      }),
    ).rejects.toThrow("Creating a note requires explicit user intent.");

    expect(mockedExecuteTool).not.toHaveBeenCalled();
  });

  it("allows create_note when user explicitly requests creation", async () => {
    const conversation = createMockConversation();

    mockedAIConversation.findOne.mockResolvedValue(conversation as any);

    mockedOpenAI
      .mockResolvedValueOnce({
        output: [
          {
            type: "function_call",
            name: "create_note",
            call_id: "create_456",
            arguments: JSON.stringify({
              title: "JavaScript Closures",
              description: "Closures in JavaScript",
              category: "JavaScript",
              tags: ["javascript"],
            }),
          },
        ],
        output_text: "",
      } as any)
      .mockResolvedValueOnce({
        output: [],
        output_text: "The note was saved successfully.",
      } as any);

    mockedExecuteTool.mockResolvedValueOnce({
      id: "507f1f77bcf86cd799439012",
      title: "JavaScript Closures",
      description: "Closures in JavaScript",
      category: "JavaScript",
      tags: ["javascript"],
      isFavorite: false,
      source: "ai",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await runAgent({
      userId,
      question: "Create a note about JavaScript closures",
      conversationId,
    });

    expect(mockedExecuteTool).toHaveBeenCalledWith(
      "create_note",
      userId,
      expect.anything(),
    );

    expect(result.answer).toBe("The note was saved successfully.");
  });

  it("blocks an unknown tool", async () => {
    const conversation = createMockConversation();

    mockedAIConversation.findOne.mockResolvedValue(conversation as any);

    mockedOpenAI.mockResolvedValueOnce({
      output: [
        {
          type: "function_call",
          name: "drop_database",
          call_id: "dangerous_123",
          arguments: JSON.stringify({}),
        },
      ],
      output_text: "",
    } as any);

    await expect(
      runAgent({
        userId,
        question: "Do something",
        conversationId,
      }),
    ).rejects.toThrow('Tool "drop_database" is not allowed');

    expect(mockedExecuteTool).not.toHaveBeenCalled();
  });
});
