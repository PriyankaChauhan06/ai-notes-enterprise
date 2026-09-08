import { createContext, useContext, type ReactNode } from "react";

import useNotes from "../hooks/useNotes";
import type { Note } from "../types/note";

interface NotesContextValue {
  notes: Note[];

  addNote: (data: {
    title: Note["title"];
    description: Note["description"];
    category: Note["category"];
    tags: Note["tags"];
    source: Note["source"];
  }) => Promise<void>;

  updateNote: (note: Note) => Promise<void>;

  deleteNote: (id: Note["id"]) => Promise<void>;

  toggleFavorite: (id: Note["id"]) => Promise<void>;

  isLoading: boolean;
}

const NotesContext = createContext<NotesContextValue | undefined>(undefined);

interface NotesProviderProps {
  children: ReactNode;
}

export function NotesProvider({ children }: NotesProviderProps) {
  const notesState = useNotes();

  return (
    <NotesContext.Provider value={notesState}>{children}</NotesContext.Provider>
  );
}

export function useNotesContext() {
  const context = useContext(NotesContext);

  if (!context) {
    throw new Error("useNotesContext must be used inside NotesProvider");
  }

  return context;
}
