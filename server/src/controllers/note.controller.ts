import type { Request, Response } from "express";

import { createNote } from "../services/note.service";

export async function createNoteController(req: Request, res: Response) {
  try {
    const note = await createNote(req.body);

    res.status(201).json({
      success: true,
      data: note,
    });
  } catch (error) {
    console.error("Create note error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create note",
    });
  }
}
