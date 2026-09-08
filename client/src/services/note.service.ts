import api from "./api";

import type { Note } from "../types/note";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export async function getNotes(): Promise<Note[]> {
  const response = await api.get<ApiResponse<Note[]>>("/note/fetchAll");

  return response.data.data;
}

export async function getNoteById(id: string): Promise<Note> {
  const response = await api.get<ApiResponse<Note>>(`/note/fetch/${id}`);

  return response.data.data;
}

export async function createNote(data: Omit<Note, "id">): Promise<Note> {
  const response = await api.post<ApiResponse<Note>>("/note/create", data);

  return response.data.data;
}

export async function updateNote(
  id: string,
  data: Partial<Omit<Note, "id">>,
): Promise<Note> {
  const response = await api.patch<ApiResponse<Note>>(
    `/note/update/${id}`,
    data,
  );

  return response.data.data;
}

export async function deleteNote(id: string): Promise<Note> {
  const response = await api.delete<ApiResponse<Note>>(`/note/delete/${id}`);

  return response.data.data;
}
