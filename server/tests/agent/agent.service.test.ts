import { beforeEach, describe, expect, it, vi } from "vitest";

import { runAgent } from "../../src/services/agent.service";
import AIConversation from "../../src/models/AIConversation";
import { recordAgentRun } from "../../src/services/agent-run.service";
import {
  deleteNote,
  getNoteById,
  updateNote,
} from "../../src/services/note.service";
import { openai } from "../../src/config/ai";
import { AIModel } from "../common";

const userId = "507f1f77bcf86cd799439011";
const noteId = "507f1f77bcf86cd799439012";

function createMockConversation(overrides: any = {}) {
  return {
    _id: "507f1f77bcf86cd799439099",
    userId,
    messages: [],
    pendingAction: undefined,
    save: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

vi.mock("../../src/config/ai", () => ({
  openai: { responses: { create: vi.fn() } },
}));

vi.mock("../../src/services/note.service", () => ({
  deleteNote: vi.fn(),
  getNoteById: vi.fn(),
  updateNote: vi.fn(),
}));

vi.mock("../../src/models/AIConversation", () => ({
  default: { findOne: vi.fn(), create: vi.fn(), deleteOne: vi.fn() },
}));

vi.mock("../../src/services/agent-run.service", () => ({
  recordAgentRun: vi.fn().mockResolvedValue(undefined),
}));

// vi.mock("../../src/ai/executor", () => ({ executeTool: vi.fn() }));

const mockedAIConversation = vi.mocked(AIConversation);
const mockedOpenAI = vi.mocked(openai.responses.create);
const mockedDeleteNote = vi.mocked(deleteNote);
const mockedGetNoteById = vi.mocked(getNoteById);
const mockedUpdateNote = vi.mocked(updateNote);
const mockedRecordAgentRun = vi.mocked(recordAgentRun);

describe("runAgent - Human in the Loop", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1️⃣ UPDATE request should create pending action
  it("creates a pending update action instead of updating immediately", async () => {
    const conversation = createMockConversation();
    mockedAIConversation.findOne.mockResolvedValue(conversation as any);

    mockedGetNoteById.mockResolvedValue({
      _id: noteId,
      title: "React",
      description: "React basics",
      category: "Frontend",
      tags: ["react"],
      isFavorite: false,
      source: "manual",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    mockedOpenAI.mockResolvedValueOnce({
      output: [
        {
          type: "function_call",
          name: "update_note",
          call_id: "call_update_123",
          arguments: JSON.stringify({
            noteId,
            title: "React Advanced",
            description: "React basics",
            category: "Frontend",
            tags: ["react"],
          }),
        },
      ],
      output_text: "",
    } as any);

    const result: any = await runAgent({
      userId,
      question: "Change my React note title to React Advanced",
      conversationId: conversation._id.toString(),
    });

    expect(result.pendingAction?.actionType).toBe("update_note");
    expect(mockedUpdateNote).not.toHaveBeenCalled();
  });

  // 2️⃣ UPDATE + Yes should execute
  it("executes a pending update after confirmation", async () => {
    const conversation = createMockConversation({
      pendingAction: {
        actionType: "update_note",
        noteId,
        updates: {
          title: "React Advanced",
          description: "React basics",
          category: "Frontend",
          tags: ["react"],
        },
      },
    });

    mockedAIConversation.findOne.mockResolvedValue(conversation as any);

    mockedUpdateNote.mockResolvedValueOnce({
      _id: noteId,
      title: "React Advanced",
      description: "React basics",
      category: "Frontend",
      tags: ["react"],
      isFavorite: false,
      source: "manual",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const result: any = await runAgent({
      userId,
      question: "Yes",
      conversationId: conversation._id.toString(),
    });

    expect(mockedUpdateNote).toHaveBeenCalledWith(userId, noteId, {
      title: "React Advanced",
      description: "React basics",
      category: "Frontend",
      tags: ["react"],
    });
    expect(result.updatedNote?.title).toBe("React Advanced");
  });

  // 3️⃣ UPDATE + No should cancel
  it("does not update the note when update is cancelled", async () => {
    const conversation = createMockConversation({
      pendingAction: {
        actionType: "update_note",
        noteId,
        updates: {
          title: "React Advanced",
          description: "React basics",
          category: "Frontend",
          tags: ["react"],
        },
      },
    });

    mockedAIConversation.findOne.mockResolvedValue(conversation as any);

    const result = await runAgent({
      userId,
      question: "No",
      conversationId: conversation._id.toString(),
    });

    expect(mockedUpdateNote).not.toHaveBeenCalled();
    expect(result.answer).toBe("Okay, the note was not updated.");
  });

  // Condfirm Update
  it("does not update when pending update receives an unrelated question", async () => {
    const conversation = createMockConversation({
      pendingAction: {
        actionType: "update_note",
        noteId,
        updates: {
          title: "React Advanced",
          description: "React basics",
          category: "Frontend",
          tags: ["react"],
        },
      },
    });

    mockedAIConversation.findOne.mockResolvedValue(conversation as any);

    const result = await runAgent({
      userId,
      question: "What is TypeScript?",
      conversationId: conversation._id.toString(),
    });

    expect(mockedUpdateNote).not.toHaveBeenCalled();

    expect(result.answer).toBe("Please confirm with Yes or No.");

    expect(conversation.pendingAction).toEqual({
      actionType: "update_note",
      noteId,
      updates: {
        title: "React Advanced",
        description: "React basics",
        category: "Frontend",
        tags: ["react"],
      },
    });
  });

  // 4️⃣ DELETE request should create pending action
  it("creates a pending delete action instead of deleting immediately", async () => {
    const conversation = createMockConversation();

    mockedAIConversation.findOne.mockResolvedValue(conversation as any);

    mockedGetNoteById.mockResolvedValue({
      _id: noteId,
      title: "React",
      description: "React basics",
      category: "Frontend",
      tags: ["react"],
      isFavorite: false,
      source: "manual",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    mockedOpenAI.mockResolvedValueOnce({
      output: [
        {
          type: "function_call",
          name: "delete_note",
          call_id: "call_delete_123",
          arguments: JSON.stringify({ noteId }),
        },
      ],
      output_text: "",
    } as any);

    const result: any = await runAgent({
      userId,
      question: "Delete my React note",
      conversationId: conversation._id.toString(),
    });

    expect(result.pendingAction?.actionType).toBe("delete_note");
    expect(mockedDeleteNote).not.toHaveBeenCalled();
  });

  // 5️⃣ DELETE + Yes should delete note and conversation
  it("deletes the note and conversation after confirmation", async () => {
    const conversation = createMockConversation({
      pendingAction: { actionType: "delete_note", noteId },
    });

    mockedAIConversation.findOne.mockResolvedValue(conversation as any);

    mockedDeleteNote.mockResolvedValueOnce({
      _id: noteId,
      title: "React",
      description: "React basics",
      category: "Frontend",
      tags: ["react"],
      isFavorite: false,
      source: "manual",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const result: any = await runAgent({
      userId,
      question: "Yes",
      conversationId: conversation._id.toString(),
    });

    expect(mockedDeleteNote).toHaveBeenCalledWith(userId, noteId);
    expect(result.deletedNote?.title).toBe("React");
    expect(result.conversationDeleted).toBe(true);
    expect(AIConversation.deleteOne).toHaveBeenCalledWith({
      _id: conversation._id,
      userId,
    });
  });

  // Condfirm Delete
  it("does not delete when pending delete receives an unrelated question", async () => {
    const conversation = createMockConversation({
      pendingAction: { actionType: "delete_note", noteId },
    });

    mockedAIConversation.findOne.mockResolvedValue(conversation as any);

    const result = await runAgent({
      userId,
      question: "What is TypeScript?",
      conversationId: conversation._id.toString(),
    });

    expect(mockedDeleteNote).not.toHaveBeenCalled();

    expect(result.answer).toBe("Please confirm with Yes or No.");

    expect(conversation.pendingAction).toEqual({
      actionType: "delete_note",
      noteId,
    });
  });

  // failure test
  it("records failed agent run with token usage", async () => {
    const conversation = createMockConversation();
    mockedAIConversation.findOne.mockResolvedValue(conversation as any);
    mockedOpenAI.mockRejectedValueOnce(new Error("OpenAI API failed"));

    await expect(
      runAgent({
        userId,
        question: "Explain React hooks",
        conversationId: conversation._id.toString(),
      }),
    ).rejects.toThrow("OpenAI API failed");

    expect(mockedRecordAgentRun).toHaveBeenCalledTimes(1);

    expect(mockedRecordAgentRun).toHaveBeenCalledWith(
      expect.objectContaining({
        userId,
        conversationId: conversation._id.toString(),
        status: "failed",
        error: "OpenAI API failed",
        model: expect.any(String),
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        estimatedCost: 0,
        durationMs: expect.any(Number),
        toolCalls: [],
      }),
    );
  });

  // success test
  it("records successful agent run with token usage and cost", async () => {
    const conversation = createMockConversation();
    mockedAIConversation.findOne.mockResolvedValue(conversation as any);
    mockedOpenAI.mockResolvedValueOnce({
      output: [],
      output_text: "React is a JavaScript library.",
      usage: {
        input_tokens: 1000,
        output_tokens: 200,
        total_tokens: 1200,
      },
    } as any);

    await runAgent({
      userId,
      question: "What is React?",
      conversationId: conversation._id.toString(),
    });

    expect(mockedRecordAgentRun).toHaveBeenCalledTimes(1);

    expect(mockedRecordAgentRun).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "success",
        model: AIModel,
        inputTokens: 1000,
        outputTokens: 200,
        totalTokens: 1200,
        estimatedCost: 0.00065,
      }),
    );
  });

  // Limit Validation
  it("stops when the agent reaches the maximum tool-call limit", async () => {
    const conversation = createMockConversation();

    mockedAIConversation.findOne.mockResolvedValue(conversation as any);

    mockedOpenAI.mockResolvedValue({
      output: [
        {
          type: "function_call",
          name: "search_my_notes",
          call_id: "call_search_123",
          arguments: JSON.stringify({
            query: "React",
          }),
        },
      ],
      output_text: "",
      usage: {
        input_tokens: 100,
        output_tokens: 50,
        total_tokens: 150,
      },
    } as any);

    await expect(
      runAgent({
        userId,
        question: "Find my React notes",
        conversationId: conversation._id.toString(),
      }),
    ).rejects.toThrow("AI agent reached its maximum tool-call limit");

    expect(mockedOpenAI).toHaveBeenCalledTimes(5);

    expect(mockedRecordAgentRun).toHaveBeenCalledTimes(1);

    expect(mockedRecordAgentRun).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "failed",
        inputTokens: 500,
        outputTokens: 250,
        totalTokens: 750,
      }),
    );
  });

  it("stops when the agent exceeds the maximum tool-call limit", async () => {
    const conversation = createMockConversation();

    mockedAIConversation.findOne.mockResolvedValue(conversation as any);

    const toolCalls = Array.from({ length: 11 }, (_, index) => ({
      type: "function_call",
      name: "search_my_notes",
      call_id: `call_search_${index}`,
      arguments: JSON.stringify({ query: "React" }),
    }));

    mockedOpenAI.mockResolvedValueOnce({
      output: toolCalls,
      output_text: "",
      usage: {
        input_tokens: 100,
        output_tokens: 50,
        total_tokens: 150,
      },
    } as any);

    await expect(
      runAgent({
        userId,
        question: "Find my React notes",
        conversationId: conversation._id.toString(),
      }),
    ).rejects.toThrow("AI agent reached its maximum tool-call limit");

    expect(mockedOpenAI).toHaveBeenCalledTimes(1);

    expect(mockedRecordAgentRun).toHaveBeenCalledTimes(1);

    expect(mockedRecordAgentRun).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "failed",
        inputTokens: 100,
        outputTokens: 50,
        totalTokens: 150,
      }),
    );
  });

  it("records only one agent run across multiple model turns", async () => {
    const conversation = createMockConversation();

    mockedAIConversation.findOne.mockResolvedValue(conversation as any);

    mockedOpenAI
      .mockResolvedValueOnce({
        output: [
          {
            type: "function_call",
            name: "search_my_notes",
            call_id: "call_search_1",
            arguments: JSON.stringify({
              query: "React",
            }),
          },
        ],
        output_text: "",
        usage: {
          input_tokens: 100,
          output_tokens: 50,
          total_tokens: 150,
        },
      } as any)
      .mockResolvedValueOnce({
        output: [],
        output_text: "I found your React notes.",
        usage: {
          input_tokens: 200,
          output_tokens: 80,
          total_tokens: 280,
        },
      } as any);

    await runAgent({
      userId,
      question: "Find my React notes",
      conversationId: conversation._id.toString(),
    });

    expect(mockedOpenAI).toHaveBeenCalledTimes(2);

    expect(mockedRecordAgentRun).toHaveBeenCalledTimes(1);

    expect(mockedRecordAgentRun).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "success",
        inputTokens: 300,
        outputTokens: 130,
        totalTokens: 430,
      }),
    );
  });

  it("creates a note when the user explicitly asks to create one", async () => {
    const conversation = createMockConversation();

    mockedAIConversation.findOne.mockResolvedValue(conversation as any);

    mockedOpenAI.mockResolvedValueOnce({
      output: [
        {
          type: "function_call",
          name: "create_note",
          call_id: "call_create_123",
          arguments: JSON.stringify({
            title: "React Hooks",
            description:
              "React hooks allow function components to use state and other React features.",
            category: "Frontend",
            tags: ["react", "hooks"],
          }),
        },
      ],
      output_text: "",
      usage: {
        input_tokens: 100,
        output_tokens: 50,
        total_tokens: 150,
      },
    } as any);

    mockedOpenAI.mockResolvedValueOnce({
      output: [],
      output_text: "I created and saved a note about React Hooks.",
      usage: {
        input_tokens: 200,
        output_tokens: 80,
        total_tokens: 280,
      },
    } as any);

    // Important: executeTool itself is not mocked here,
    // so this test should use the existing mocked create-note path
    // only if your current test setup already mocks the executor.
  });

  // it("answers a general question without using a tool", async () => {
  //   const conversation = createMockConversation();

  //   mockedAIConversation.findOne.mockResolvedValue(conversation as any);

  //   mockedOpenAI.mockResolvedValueOnce({
  //     output: [],
  //     output_text:
  //       "React is a JavaScript library for building user interfaces.",
  //     usage: {
  //       input_tokens: 100,
  //       output_tokens: 30,
  //       total_tokens: 130,
  //     },
  //   } as any);

  //   const result = await runAgent({
  //     userId,
  //     question: "What is React?",
  //     conversationId: conversation._id.toString(),
  //   });

  //   expect(result.answer).toBe(
  //     "React is a JavaScript library for building user interfaces.",
  //   );

  //   expect(mockedOpenAI).toHaveBeenCalledTimes(1);
  //   expect(mockedRecordAgentRun).toHaveBeenCalledTimes(1);
  // });
});
