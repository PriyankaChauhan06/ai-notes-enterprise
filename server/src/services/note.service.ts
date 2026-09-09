import Note from "../models/Note";
import { AppError } from "../utils/app-error";

interface CreateNoteData {
  title: string;
  description: string;
  category: string;
  tags?: string[];
  isFavorite?: boolean;
  source?: "manual" | "ai";
}

export async function createNote(userId: string, data: CreateNoteData) {
  return await Note.create({ ...data, userId });
}

export async function getNotes(userId: string) {
  return await Note.find({ userId }).sort({ createdAt: -1 });
}

export async function getNoteById(userId: string, noteId: string) {
  const note = await Note.findOne({ _id: noteId, userId });
  if (!note) throw new AppError("Note not found", 404);

  return note;
}

export async function updateNote(
  userId: string,
  noteId: string,
  data: Partial<CreateNoteData>,
) {
  const note = await Note.findOneAndUpdate({ _id: noteId, userId }, data, {
    new: true,
    runValidators: true,
  });
  if (!note) throw new AppError("Note not found", 404);

  return note;
}

export async function deleteNote(userId: string, noteId: string) {
  const note = await Note.findOneAndDelete({ _id: noteId, userId });
  if (!note) throw new AppError("Note not found", 404);

  return note;
}
