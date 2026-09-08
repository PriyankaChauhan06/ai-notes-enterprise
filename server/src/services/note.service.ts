import Note from "../models/Note";

interface CreateNoteData {
  title: string;
  description: string;
  category: string;
  tags?: string[];
  source?: "manual" | "ai";
}

export async function createNote(data: CreateNoteData) {
  const note = await Note.create({
    title: data.title,
    description: data.description,
    category: data.category,
    tags: data.tags ?? [],
    source: data.source ?? "manual",
  });

  return note;
}
