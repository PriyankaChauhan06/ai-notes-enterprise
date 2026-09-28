import { beforeEach, describe, expect, it, vi } from "vitest";

import { runAgent } from "../../src/services/agent.service";
import AIConversation from "../../src/models/AIConversation";
import {
  deleteNote,
  getNoteById,
  updateNote,
} from "../../src/services/note.service";
import { openai } from "../../src/config/ai";

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

const mockedAIConversation = vi.mocked(AIConversation);
const mockedOpenAI = vi.mocked(openai.responses.create);
const mockedDeleteNote = vi.mocked(deleteNote);
const mockedGetNoteById = vi.mocked(getNoteById);
const mockedUpdateNote = vi.mocked(updateNote);

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

    const result = await runAgent({
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

    const result = await runAgent({
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

    const result = await runAgent({
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

    const result = await runAgent({
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
});
