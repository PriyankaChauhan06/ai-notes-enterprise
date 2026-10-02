import { Types } from "mongoose";
import { deleteNote } from "../../services/note.service";
import { deleteNoteToolSchema } from "../../utils/validation/agent.validation";

export async function executeDeleteNote(userId: string, args: unknown) {
  const data = deleteNoteToolSchema.parse(args);
  if (!Types.ObjectId.isValid(data.noteId)) throw new Error("Invalid note ID");

  const note = await deleteNote(userId, data.noteId);
  return {
    deletedNote: {
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

    message: "Note deleted successfully.",
  };
}
