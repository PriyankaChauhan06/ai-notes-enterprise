import { describe, expect, it, vi, beforeEach } from "vitest";
import { executeUpdateNote } from "../../src/ai/executors/update-note.executor";
import { updateNote } from "../../src/services/note.service";

const TestNoteId: string = "507f1f77bcf86cd799439011";

vi.mock("../../src/services/note.service", () => ({ updateNote: vi.fn() }));

const mockedUpdateNote = vi.mocked(updateNote);

describe("executeUpdateNote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it("rejects an invalid note id", async () => {
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
});
