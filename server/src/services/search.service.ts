import { Types } from "mongoose";
import NoteChunk from "../models/NoteChunk";
import { SemanticSearchData } from "../types/search";
import { generateEmbedding } from "./embedding.service";

const MAX_CHUNKS_PER_NOTE = 2;
const RAG_NUM_CANDIDATES = 50;
const RAG_VECTOR_LIMIT = 20;
const RAG_RESULT_LIMIT = 5;
const RAG_MIN_SCORE = 0.7; // 0.75

export async function semanticSearch({ userId, query }: SemanticSearchData) {
  const queryEmbedding = await generateEmbedding(query);

  const userObjectId = new Types.ObjectId(userId);

  const results = await NoteChunk.aggregate([
    {
      $vectorSearch: {
        index: "note_chunk_vector_index",
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: RAG_NUM_CANDIDATES,
        limit: RAG_VECTOR_LIMIT,
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
    { $match: { score: { $gte: RAG_MIN_SCORE } } },
    { $limit: RAG_RESULT_LIMIT },
  ]);

  const finalResults: typeof results = [];
  const noteChunkCount = new Map<string, number>();

  for (const result of results) {
    const noteId = result.noteId.toString();
    const count = noteChunkCount.get(noteId) ?? 0;

    if (count >= MAX_CHUNKS_PER_NOTE) {
      continue;
    }

    finalResults.push(result);
    noteChunkCount.set(noteId, count + 1);
  }

  // results?.length &&
  //   console.log(
  //     "results: ",
  //     results.map((result) => ({
  //       noteId: result.noteId.toString(),
  //       score: result.score,
  //       chunkIndex: result.chunkIndex,
  //     })),
  //   );

  return finalResults;
}
