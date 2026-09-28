import { Types } from "mongoose";
import { getNoteById } from "../../services/note.service";
import { getNoteToolSchema } from "../../utils/validation/agent.validation";

export async function executeGetNote(userId: string, args: unknown) {
  const data = getNoteToolSchema.parse(args);
  if (!Types.ObjectId.isValid(data.noteId)) throw new Error("Invalid note ID");

  const note = await getNoteById(userId, data.noteId);

  return {
    id: note._id.toString(),
    title: note.title,
    description: note.description,
    category: note.category,
    tags: note.tags,
    isFavorite: note.isFavorite,
    source: note.source,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
}
