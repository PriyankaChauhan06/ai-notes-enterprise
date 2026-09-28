import { describe, expect, it, vi, beforeEach } from "vitest";
import { executeGetNote } from "../../src/ai/executors/get-note.executor";
import { getNoteById } from "../../src/services/note.service";

const TestNoteId: string = "507f1f77bcf86cd799439011";

vi.mock("../../src/services/note.service", () => ({ getNoteById: vi.fn() }));

const mockedGetNoteById = vi.mocked(getNoteById);

describe("executeGetNote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a note for a valid note id", async () => {
    mockedGetNoteById.mockResolvedValue({
      _id: TestNoteId,
      title: "React",
      description: "React basics",
      category: "Frontend",
      tags: ["react", "javascript"],
      isFavorite: false,
      source: "manual",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const result = await executeGetNote("user-123", { noteId: TestNoteId });
    expect(result.title).toBe("React");
    expect(getNoteById).toHaveBeenCalledWith("user-123", TestNoteId);
  });

  it("rejects an invalid note id", async () => {
    await expect(
      executeGetNote("user-123", { noteId: "invalid-id" }),
    ).rejects.toThrow("Invalid note ID");

    expect(getNoteById).not.toHaveBeenCalled();
  });
});
