import api from "./api";
import type { Note, CreateNoteData, ApiResponse } from "../types/note";

function mapNote(note: Note): Note {
  return {
    id: note._id,
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

export async function getNotes(): Promise<Note[]> {
  const response = await api.get<ApiResponse<Note[]>>("/note/fetchAll");

  return response.data.data.map(mapNote);
}

export async function getNoteById(id: string): Promise<Note> {
  const response = await api.get<ApiResponse<Note>>(`/note/fetch/${id}`);

  return response.data.data;
}

export async function getAllCategory(): Promise<string[]> {
  const response = await api.get<ApiResponse<string[]>>(
    `/note/fetchAll/category`,
  );

  const categories = response.data.data;

  if (categories?.length) {
    categories.unshift("All");
  }

  return categories;
}

export async function createNote(data: CreateNoteData): Promise<Note> {
  const response = await api.post<ApiResponse<Note>>("/note/create", data);
  return mapNote(response.data.data);
}

export async function updateNote(
  id: Note["id"],
  data: Partial<Omit<Note, "id">>,
): Promise<Note> {
  const response = await api.patch<ApiResponse<Note>>(
    `/note/update/${id}`,
    data,
  );

  return mapNote(response.data.data);
}

export async function deleteNote(id: Note["id"]): Promise<Note> {
  const response = await api.delete<ApiResponse<Note>>(`/note/delete/${id}`);

  return mapNote(response.data.data);
}
