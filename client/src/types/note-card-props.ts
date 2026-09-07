import type { Note } from "./note";

export interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: Note["id"]) => void;
}
