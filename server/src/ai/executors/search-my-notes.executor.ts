import { Types } from "mongoose";
import Note from "../../models/Note";
import { semanticSearch } from "../../services/search.service";
import { searchMyNotesToolSchema } from "../../utils/validation/agent.validation";

export async function executeSearchMyNotes(userId: string, args: unknown) {
  const data = searchMyNotesToolSchema.parse(args);

  const results = await semanticSearch({ userId, query: data.query });
  if (!results.length) return [];

  const noteIds = [
    ...new Set(results.map((result) => result.noteId.toString())),
  ].map((id) => new Types.ObjectId(id));

  const notes = await Note.find({
    _id: { $in: noteIds },
    userId: new Types.ObjectId(userId),
  }).select("_id title category");

  const noteMap = new Map(notes.map((note) => [note._id.toString(), note]));

  return results.map((result) => {
    const note = noteMap.get(result.noteId.toString());

    return {
      noteId: result.noteId.toString(),
      title: note?.title ?? "Unknown",
      category: note?.category ?? "Unknown",
      content: result.content,
      score: result.score,
    };
  });
}
