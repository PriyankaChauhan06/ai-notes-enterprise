import { describe, expect, it, vi } from "vitest";
import { semanticSearch } from "../../src/services/search.service";
import { openai } from "../../src/config/ai";
import Note from "../../src/models/Note";
import AIConversation from "../../src/models/AIConversation";
import { askWithRAG } from "../../src/services/rag.service";

const userId = "507f1f77bcf86cd799439011";
const noteId = "507f1f77bcf86cd799439012";

vi.mock("../../src/services/search.service", () => ({
  semanticSearch: vi.fn(),
}));

vi.mock("../../src/config/ai", () => ({
  openai: { responses: { create: vi.fn() } },
}));

vi.mock("../../src/models/Note", () => ({ default: { find: vi.fn() } }));

vi.mock("../../src/models/AIConversation", () => ({
  default: { create: vi.fn() },
}));

describe("askWithRAG", () => {
  it("should return an answer and sources when relevant notes are found", async () => {
    vi.mocked(semanticSearch).mockResolvedValue([
      {
        _id: "chunk-1",
        noteId,
        content: "useState is used to manage state in React.",
        chunkIndex: 0,
        score: 0.91,
      },
    ]);

    const note = {
      _id: noteId,
      title: "React Hooks",
      category: "Frontend",
      tags: ["react", "hooks"],
      source: "manual",
    };

    vi.mocked(Note.find).mockReturnValue({
      select: vi.fn().mockResolvedValue([note]),
    } as any);

    vi.mocked(openai.responses.create).mockResolvedValue({
      output_text: "useState is used to manage state in React.",
    } as any);

    vi.mocked(AIConversation.create).mockResolvedValue({} as any);

    const result = await askWithRAG({
      userId,
      question: "What is useState used for?",
    });

    expect(semanticSearch).toHaveBeenCalledWith({
      userId,
      query: "What is useState used for?",
    });

    expect(openai.responses.create).toHaveBeenCalledTimes(1);

    expect(result.answer).toBe("useState is used to manage state in React.");

    expect(result.sources).toEqual([
      {
        noteId,
        title: "React Hooks",
        category: "Frontend",
        score: 0.91,
      },
    ]);
  });

  it("should return no sources when no relevant notes are found", async () => {
    vi.mocked(semanticSearch).mockResolvedValue([]);

    const result = await askWithRAG({
      userId,
      question: "What did I write about Kubernetes?",
    });

    expect(result).toEqual({
      answer: "I couldn't find any relevant information in your notes.",
      sources: [],
    });

    expect(openai.responses.create).not.toHaveBeenCalled();
    expect(Note.find).not.toHaveBeenCalled();
  });
});
