import { Types } from "mongoose";
import { openai } from "../config/ai";
import Note from "../models/Note";
import { semanticSearch } from "./search.service";
import AIConversation from "../models/AIConversation";

const AIModel: any = process.env.AI_MODEL;

interface AskWithRAGData {
  userId: string;
  question: string;
}

export async function askWithRAG({ userId, question }: AskWithRAGData) {
  const relevantChunks = await semanticSearch({ userId, query: question });

  if (!relevantChunks?.length) {
    return {
      answer: "I couldn't find any relevant information in your notes.",
      sources: [],
    };
  }

  const noteIds = [
    ...new Set(relevantChunks.map((chunk) => chunk.noteId.toString())),
  ].map((id) => new Types.ObjectId(id));

  const notes = await Note.find({
    _id: { $in: noteIds },
    userId: new Types.ObjectId(userId),
  }).select("_id title category tags source");

  const noteMap = new Map(notes.map((note) => [note._id.toString(), note]));

  const context = relevantChunks
    .map((chunk, index) => {
      const note = noteMap.get(chunk.noteId.toString());
      return `
        Source ${index + 1}
        Title: ${note?.title ?? "Unknown"}
        Category: ${note?.category ?? "Unknown"}
        Content:
        ${chunk.content}
        `;
    })
    .join("\n");

  const response = await openai.responses.create({
    model: AIModel,
    instructions: `
      You are the AI knowledge assistant for a personal notes application.

      Answer the user's question using the retrieved notes as your primary context.

      Rules:
      - Prefer information from the retrieved notes.
      - Do not pretend that information came from the user's notes when it did not.
      - If the notes do not contain enough information, clearly say so.
      - You may use general knowledge to clarify the answer.
      - Give a clear, useful answer.
    `,
    input: `
      User Question: ${question}
      Retrieved Notes: ${context}
    `,
  });

  const sourceMap = new Map<
    string,
    { noteId: string; title: string; category: string; score: number }
  >();

  for (const chunk of relevantChunks) {
    const note = noteMap.get(chunk.noteId.toString());

    if (!note) {
      continue;
    }

    const id = note._id.toString();

    if (!sourceMap.has(id)) {
      sourceMap.set(id, {
        noteId: id,
        title: note.title,
        category: note.category,
        score: chunk.score,
      });
    }
  }

  const answer = response.output_text;
  await AIConversation.create({
    userId,
    question,
    answer,
    sources: Array.from(sourceMap.values()).map((source) => ({
      noteId: source.noteId,
      title: source.title,
      score: source.score,
    })),
  });

  return { answer, sources: Array.from(sourceMap.values()) };
}
