import { useCallback } from "react";

import useLocalStorage from "./useLocalStorage";
import { DEFAULT_NOTES } from "../constants/default-notes";
import { STORAGE_KEYS } from "../constants/storage-keys";

import type { Note } from "../types/note";

interface CreateNoteData {
  title: Note["title"];
  description: Note["description"];
  category: Note["category"];
  tags: Note["tags"];
  source: Note["source"];
}

function useNotes() {
  const [notes, setNotes] = useLocalStorage<Note[]>(
    STORAGE_KEYS.NOTES,
    DEFAULT_NOTES,
  );

  const addNote = useCallback(
    ({ title, description, category, tags, source }: CreateNoteData) => {
      const newNote: Note = {
        id: Date.now(),
        title,
        description,
        category,
        tags,
        source,
        isFavorite: false,
      };

      setNotes((currentNotes) => [...currentNotes, newNote]);
    },
    [setNotes],
  );

  const updateNote = useCallback(
    (updatedNote: Note) => {
      setNotes((currentNotes) =>
        currentNotes.map((note) =>
          note.id === updatedNote.id ? updatedNote : note,
        ),
      );
    },
    [setNotes],
  );

  const deleteNote = useCallback(
    (id: Note["id"]) => {
      setNotes((currentNotes) => currentNotes.filter((note) => note.id !== id));
    },
    [setNotes],
  );

  const toggleFavorite = useCallback(
    (id: Note["id"]) => {
      setNotes((currentNotes) =>
        currentNotes.map((note) =>
          note.id === id
            ? {
                ...note,
                isFavorite: !note.isFavorite,
              }
            : note,
        ),
      );
    },
    [setNotes],
  );

  return {
    notes,
    addNote,
    updateNote,
    deleteNote,
    toggleFavorite,
  };
}

export default useNotes;
