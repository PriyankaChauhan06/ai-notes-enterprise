import type { Request, Response } from "express";
import {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
} from "../services/note.service";
import { AppError } from "../utils/AppError";

// Create Note
export async function createNoteController(req: Request, res: Response) {
  const note = await createNote(req.body);
  res.status(201).json({ success: true, data: note });
}

// Get All Notes
export async function getNotesController(_req: Request, res: Response) {
  const notes = await getNotes();
  res.status(200).json({ success: true, data: notes });
}

// Get Note by ID
export async function getNoteByIdController(req: Request, res: Response) {
  const { id } = req.params;
  const note = await getNoteById(id as string);
  if (!note) throw new AppError("Note not found", 404);

  res.status(200).json({ success: true, data: note });
}

// Update Note
export async function updateNoteController(req: Request, res: Response) {
  const { id } = req.params;
  const note = await updateNote(id as string, req.body);
  if (!note) throw new AppError("Note not found", 404);

  res.status(200).json({ success: true, data: note });
}

// Delete Note
export async function deleteNoteController(req: Request, res: Response) {
  const { id } = req.params;
  const note = await deleteNote(id as string);
  if (!note) throw new AppError("Note not found", 404);

  res.status(200).json({
    success: true,
    message: "Note deleted successfully",
    data: note,
  });
}
