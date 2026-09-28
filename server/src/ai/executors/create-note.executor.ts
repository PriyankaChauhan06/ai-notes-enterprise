import { createNote } from "../../services/note.service";
import { createNoteToolSchema } from "../../utils/validation/agent.validation";

export async function executeCreateNote(userId: string, args: unknown) {
  const data = createNoteToolSchema.parse(args);

  const note = await createNote(userId, {
    title: data.title,
    description: data.description,
    category: data.category,
    tags: data.tags,
    source: "ai",
  });

  return {
    note: {
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
    message: "Note created successfully.",
  };
}
