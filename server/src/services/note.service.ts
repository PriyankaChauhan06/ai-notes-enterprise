import { Types } from "mongoose";
import Note from "../models/Note";
import NoteChunk from "../models/NoteChunk";
import { AppError } from "../utils/app-error";
import { chunkText } from "../utils/chunk-text";
import { CreateNoteData } from "../types/note";
import { generateEmbeddings } from "./embedding.service";

export async function createNote(userId: string, data: CreateNoteData) {
  const noteId = new Types.ObjectId();

  const { title, description, category, tags } = data;
  const textForEmbedding = [title, description, category, ...(tags ?? [])].join(
    "\n",
  );

  const chunks: any = chunkText(textForEmbedding);
  const embeddings = await generateEmbeddings(chunks);

  const note = await Note.create({ _id: noteId, ...data, userId });

  await NoteChunk.insertMany(
    chunks.map((content: any, index: number) => ({
      noteId,
      userId,
      content,
      chunkIndex: index,
      embedding: embeddings[index],
    })),
  );

  return note;
}

export async function getNotes(userId: string) {
  return await Note.find({ userId }).sort({ createdAt: -1 });
}

export async function getNoteById(userId: string, noteId: string) {
  const note = await Note.findOne({ _id: noteId, userId });
  if (!note) throw new AppError("Note not found", 404);

  return note;
}

export async function getAllCategory(userId: string) {
  return await Note.find({ userId }).distinct("category");
}

export async function updateNote(
  userId: string,
  noteId: string,
  data: Partial<CreateNoteData>,
) {
  const note = await Note.findOne({ _id: noteId, userId });
  if (!note) throw new AppError("Note not found", 404);

  const updatedTitle = data.title ?? note.title;
  const updatedDescription = data.description ?? note.description;
  const updatedCategory = data.category ?? note.category;
  const updatedTags = data.tags ?? note.tags;

  const textForEmbedding = [
    updatedTitle,
    updatedDescription,
    updatedCategory,
    ...updatedTags,
  ].join("\n");

  const chunks = chunkText(textForEmbedding);
  const embeddings = await generateEmbeddings(chunks);

  note.title = updatedTitle;
  note.description = updatedDescription;
  note.category = updatedCategory;
  note.tags = updatedTags;

  if (data.isFavorite !== undefined) {
    note.isFavorite = data.isFavorite;
  }

  if (data.source !== undefined) {
    note.source = data.source;
  }

  await note.save();

  await NoteChunk.deleteMany({ noteId: note._id, userId });

  await NoteChunk.insertMany(
    chunks.map((content, index) => ({
      noteId: note._id,
      userId,
      content,
      chunkIndex: index,
      embedding: embeddings[index],
    })),
  );

  return note;
}

export async function deleteNote(userId: string, noteId: string) {
  const note = await Note.findOneAndDelete({ _id: noteId, userId });
  if (!note) throw new AppError("Note not found", 404);

  await NoteChunk.deleteMany({ noteId, userId });

  return note;
}
