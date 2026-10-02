import { describe, expect, it, vi, beforeEach } from "vitest";
import { executeGetNote } from "../../src/ai/executors/get-note.executor";
import { executeUpdateNote } from "../../src/ai/executors/update-note.executor";
import { executeDeleteNote } from "../../src/ai/executors/delete-note.executor";
import {
  deleteNote,
  getNoteById,
  updateNote,
} from "../../src/services/note.service";

const TestNoteId: string = "507f1f77bcf86cd799439011";

vi.mock("../../src/services/note.service", () => ({
  getNoteById: vi.fn(),
  updateNote: vi.fn(),
  deleteNote: vi.fn(),
}));

const mockedGetNoteById = vi.mocked(getNoteById);
const mockedUpdateNote = vi.mocked(updateNote);
const mockedDeleteNote = vi.mocked(deleteNote);

describe("executeGetNote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Get Note
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

  it("rejects an invalid note id for fetch", async () => {
    await expect(
      executeGetNote("user-123", { noteId: "invalid-id" }),
    ).rejects.toThrow("Invalid note ID");

    expect(getNoteById).not.toHaveBeenCalled();
  });

  // Update Note
  it("updates a valid note", async () => {
    mockedUpdateNote.mockResolvedValue({
      _id: TestNoteId,
      title: "React Advanced",
      description: "Advanced React concepts",
      category: "Frontend",
      tags: ["react", "hooks"],
      isFavorite: false,
      source: "manual",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const result = await executeUpdateNote("user-123", {
      noteId: TestNoteId,
      title: "React Advanced",
      description: "Advanced React concepts",
      category: "Frontend",
      tags: ["react", "hooks"],
    });

    expect(result.updatedNote.title).toBe("React Advanced");

    expect(updateNote).toHaveBeenCalledWith("user-123", TestNoteId, {
      title: "React Advanced",
      description: "Advanced React concepts",
      category: "Frontend",
      tags: ["react", "hooks"],
    });
  });

  it("rejects an invalid note id for update", async () => {
    await expect(
      executeUpdateNote("user-123", {
        noteId: "invalid-id",
        title: "React Advanced",
        description: "Advanced React concepts",
        category: "Frontend",
        tags: ["react"],
      }),
    ).rejects.toThrow("Invalid note ID");

    expect(updateNote).not.toHaveBeenCalled();
  });

  it("rejects invalid update data", async () => {
    await expect(
      executeUpdateNote("user-123", {
        noteId: TestNoteId,
        title: "",
        description: "React",
        category: "Frontend",
        tags: [],
      }),
    ).rejects.toThrow();

    expect(updateNote).not.toHaveBeenCalled();
  });

  // Delete Note
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

  it("rejects an invalid note id for delete", async () => {
    await expect(
      executeDeleteNote("user-123", {
        noteId: "invalid-id",
      }),
    ).rejects.toThrow("Invalid note ID");

    expect(deleteNote).not.toHaveBeenCalled();
  });
});
