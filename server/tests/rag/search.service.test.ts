import { describe, expect, it, vi } from "vitest";
import NoteChunk from "../../src/models/NoteChunk";
import { generateEmbedding } from "../../src/services/embedding.service";
import { semanticSearch } from "../../src/services/search.service";

const userId = "507f1f77bcf86cd799439011";

vi.mock("../../src/services/embedding.service", () => ({
  generateEmbedding: vi.fn(),
}));

vi.mock("../../src/models/NoteChunk", () => ({
  default: { aggregate: vi.fn() },
}));

describe("semanticSearch", () => {
  it("should retrieve relevant chunks for the given user", async () => {
    vi.mocked(generateEmbedding).mockResolvedValue([0.1, 0.2, 0.3]);

    const results = [
      {
        _id: "chunk-1",
        noteId: "note-1",
        content: "React useState manages component state.",
        chunkIndex: 0,
        score: 0.91,
      },
    ];

    vi.mocked(NoteChunk.aggregate).mockResolvedValue(results);

    const response = await semanticSearch({
      userId,
      query: "What is useState used for?",
    });

    expect(generateEmbedding).toHaveBeenCalledWith(
      "What is useState used for?",
    );

    expect(NoteChunk.aggregate).toHaveBeenCalledTimes(1);

    expect(response).toEqual(results);

    const pipeline = vi.mocked(NoteChunk.aggregate).mock.calls[0][0];

    const vectorSearchStage = pipeline[0] as unknown as {
      $vectorSearch: { filter: unknown };
    };

    expect(vectorSearchStage.$vectorSearch.filter).toEqual({
      userId: expect.anything(),
    });
  });
});
