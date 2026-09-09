import type { Request, Response } from "express";
import {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
} from "../services/note.service";
import { AppError } from "../utils/app-error";
import { getParamId, isValidNoteId } from "../utils/is-valid-object-id";

// Create Note
export async function createNoteController(req: Request, res: Response) {
  const note = await createNote(req.userId, req.body);
  res.status(201).json({ success: true, data: note });
}

// Get All Notes
export async function getNotesController(req: Request, res: Response) {
  const notes = await getNotes(req.userId);
  res.status(200).json({ success: true, data: notes });
}

// Get Note by ID
export async function getNoteByIdController(req: Request, res: Response) {
  const id = getParamId(req.params.id);

  if (!isValidNoteId(id)) throw new AppError("Invalid note id", 400);

  const note = await getNoteById(req.userId, id);
  if (!note) throw new AppError("Note not found", 404);

  res.status(200).json({ success: true, data: note });
}

// Update Note
export async function updateNoteController(req: Request, res: Response) {
  const id = getParamId(req.params.id);

  if (!isValidNoteId(id)) throw new AppError("Invalid note id", 400);

  const note = await updateNote(req.userId, id, req.body);
  if (!note) throw new AppError("Note not found", 404);

  res.status(200).json({ success: true, data: note });
}

// Delete Note
export async function deleteNoteController(req: Request, res: Response) {
  const id = getParamId(req.params.id);

  if (!isValidNoteId(id)) throw new AppError("Invalid note id", 400);

  const note = await deleteNote(req.userId, id);
  if (!note) throw new AppError("Note not found", 404);

  res.status(200).json({
    success: true,
    message: "Note deleted successfully",
    data: note,
  });
}
