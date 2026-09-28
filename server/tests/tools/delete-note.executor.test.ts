import { describe, expect, it, vi, beforeEach } from "vitest";
import { executeDeleteNote } from "../../src/ai/executors/delete-note.executor";
import { deleteNote } from "../../src/services/note.service";

const TestNoteId: string = "507f1f77bcf86cd799439011";

vi.mock("../../src/services/note.service", () => ({ deleteNote: vi.fn() }));

const mockedDeleteNote = vi.mocked(deleteNote);

describe("executeDeleteNote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes a valid note for the current user", async () => {
    mockedDeleteNote.mockResolvedValue({
      _id: TestNoteId,
      title: "React",
      description: "React basics",
      category: "Frontend",
      tags: ["react"],
      isFavorite: false,
      source: "manual",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const result = await executeDeleteNote("user-123", { noteId: TestNoteId });
    expect(result.deletedNote.id).toBe(TestNoteId);
    expect(deleteNote).toHaveBeenCalledWith("user-123", TestNoteId);
  });

  it("rejects an invalid note id", async () => {
    await expect(
      executeDeleteNote("user-123", {
        noteId: "invalid-id",
      }),
    ).rejects.toThrow("Invalid note ID");

    expect(deleteNote).not.toHaveBeenCalled();
  });
});
