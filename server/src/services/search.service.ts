import { Types } from "mongoose";
import NoteChunk from "../models/NoteChunk";
import { generateEmbedding } from "./embedding.service";

const RAGMinScore: any = process.env.RAG_MIN_SCORE ?? "0.75";

interface SemanticSearchData {
  userId: string;
  query: string;
}

export async function semanticSearch({ userId, query }: SemanticSearchData) {
  const queryEmbedding = await generateEmbedding(query);

  const userObjectId = new Types.ObjectId(userId);

  const results = await NoteChunk.aggregate([
    {
      $vectorSearch: {
        index: "note_chunk_vector_index",
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: 50,
        limit: 8,
        filter: { userId: userObjectId },
      },
    },
    {
      $project: {
        _id: 1,
        noteId: 1,
        content: 1,
        chunkIndex: 1,
        score: { $meta: "vectorSearchScore" },
      },
    },
    { $match: { score: { $gte: RAGMinScore } } },
    { $limit: 5 },
  ]);

  return results;
}
