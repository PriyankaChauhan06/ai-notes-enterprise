import { executeSearchMyNotes } from "./executors/search-my-notes.executor";
import { executeGetNote } from "./executors/get-note.executor";
import { executeCreateNote } from "./executors/create-note.executor";
import { executeDeleteNote } from "./executors/delete-note.executor";
import { executeUpdateNote } from "./executors/update-note.executor";

export async function executeTool(name: string, userId: string, args: unknown) {
  switch (name) {
    case "search_my_notes":
      return executeSearchMyNotes(userId, args as { query: string });

    case "get_note":
      return executeGetNote(userId, args as { noteId: string });

    case "create_note":
      return executeCreateNote(userId, args);

    case "delete_note":
      return executeDeleteNote(userId, args);

    case "update_note":
      return executeUpdateNote(userId, args);

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
