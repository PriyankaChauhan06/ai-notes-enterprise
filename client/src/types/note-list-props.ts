import type { Note } from "./note";

export interface NoteListProps {
  notes: Note[];
  onEditNote: (note: Note) => void;
  onDeleteNote: (id: Note["id"]) => void;
}
