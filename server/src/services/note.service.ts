import Note from "../models/Note";

interface CreateNoteData {
  title: string;
  description: string;
  category: string;
  tags?: string[];
  source?: "manual" | "ai";
}

export async function createNote(data: CreateNoteData) {
  return await Note.create({
    title: data.title,
    description: data.description,
    category: data.category,
    tags: data.tags ?? [],
    source: data.source ?? "manual",
  });
}

export async function getNotes() {
  return await Note.find().sort({ createdAt: -1 });
}

export async function getNoteById(id: string) {
  return await Note.findById(id);
}

export async function updateNote(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    category: string;
    tags: string[];
    isFavorite: boolean;
    source: "manual" | "ai";
  }>,
) {
  return await Note.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
}

export async function deleteNote(id: string) {
  return await Note.findByIdAndDelete(id);
}
