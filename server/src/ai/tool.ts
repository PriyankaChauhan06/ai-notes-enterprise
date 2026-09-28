import { searchMyNotesTool } from "./tools/search-my-notes.tool";
import { getNoteTool } from "./tools/get-note.tool";
import { createNoteTool } from "./tools/create-note.tool";
import { deleteNoteTool } from "./tools/delete-note.tool";
import { updateNoteTool } from "./tools/update-note.tool";

export const agentTools = [
  searchMyNotesTool,
  getNoteTool,
  createNoteTool,
  deleteNoteTool,
  updateNoteTool,
];
