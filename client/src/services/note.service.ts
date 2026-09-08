import api from "./api";
import type { Note } from "../types/note";

interface NoteApiResponse {
  _id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  isFavorite: boolean;
  source: "manual" | "ai";
  createdAt?: string;
  updatedAt?: string;
}

interface CreateNoteData {
  title: string;
  description: string;
  category: string;
  tags: string[];
  source: "manual" | "ai";
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

function mapNote(note: NoteApiResponse): Note {
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
  const response =
    await api.get<ApiResponse<NoteApiResponse[]>>("/note/fetchAll");

  return response.data.data.map(mapNote);
}

export async function getNoteById(id: string): Promise<Note> {
  const response = await api.get<ApiResponse<Note>>(`/note/fetch/${id}`);

  return response.data.data;
}

export async function createNote(data: CreateNoteData): Promise<Note> {
  const response = await api.post<ApiResponse<NoteApiResponse>>(
    "/note/create",
    data,
  );
  return mapNote(response.data.data);
}

export async function updateNote(
  id: Note["id"],
  data: Partial<Omit<Note, "id">>,
): Promise<Note> {
  const response = await api.patch<ApiResponse<NoteApiResponse>>(
    `/note/update/${id}`,
    data,
  );

  return mapNote(response.data.data);
}

export async function deleteNote(id: Note["id"]): Promise<Note> {
  const response = await api.delete<ApiResponse<NoteApiResponse>>(
    `/note/delete/${id}`,
  );

  return mapNote(response.data.data);
}
