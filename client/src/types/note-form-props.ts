import type { Note } from "./note";

export interface NoteFormProps {
  editingNote: Note | null;
  onAddNote: (
    title: Note["title"],
    description: Note["description"],
    category: Note["category"],
    tags: Note["tags"],
  ) => void;
}
