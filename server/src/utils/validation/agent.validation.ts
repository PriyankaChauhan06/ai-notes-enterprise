import { z } from "zod";

export const getNoteToolSchema = z.object({
  noteId: z.string().min(1),
});

export const searchMyNotesToolSchema = z.object({
  query: z.string().trim().min(1).max(500),
});

export const createNoteToolSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(20000),
  category: z.string().trim().min(1).max(100),
  tags: z.array(z.string().trim().min(1).max(50)).max(10),
});

export const updateNoteToolSchema = z.object({
  noteId: z.string().min(1),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(20000),
  category: z.string().trim().min(1).max(100),
  tags: z.array(z.string().trim().min(1).max(50)).max(10),
});

export const deleteNoteToolSchema = z.object({
  noteId: z.string().min(1),
});
