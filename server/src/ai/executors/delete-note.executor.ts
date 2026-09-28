import { Types } from "mongoose";
import { deleteNote } from "../../services/note.service";

export async function executeDeleteNote(userId: string, args: unknown) {
  const { noteId } = args as { noteId: string };
  if (!Types.ObjectId.isValid(noteId)) throw new Error("Invalid note ID");

  const note = await deleteNote(userId, noteId);
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
