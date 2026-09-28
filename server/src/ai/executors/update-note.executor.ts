import { Types } from "mongoose";
import { updateNote } from "../../services/note.service";
import { updateNoteToolSchema } from "../../utils/validation/agent.validation";

export async function executeUpdateNote(userId: string, args: unknown) {
  const data = updateNoteToolSchema.parse(args);
  if (!Types.ObjectId.isValid(data.noteId)) throw new Error("Invalid note ID");

  const note = await updateNote(userId, data.noteId, {
    title: data.title,
    description: data.description,
    category: data.category,
    tags: data.tags,
  });

  return {
    updatedNote: {
      id: note._id.toString(),
      title: note.title,
      description: note.description,
      category: note.category,
      tags: note.tags,
      isFavorite: note.isFavorite,
      source: note.source,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    },
    message: "Note updated successfully.",
  };
}
