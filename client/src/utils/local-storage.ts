import { STORAGE_KEYS } from "../constants/storage-keys";
import type { Note } from "../types/note";
import { DEFAULT_NOTES } from "../constants/default-notes";

export function getNotesFromStorage(): Note[] {
  const storedNotes = localStorage.getItem(STORAGE_KEYS.NOTES);

  if (!storedNotes) {
    return DEFAULT_NOTES;
  }

  return JSON.parse(storedNotes);
}
