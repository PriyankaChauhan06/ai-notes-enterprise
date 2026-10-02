import type { ReactNode } from "react";
import type { Note } from "./note";

export interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: Note["id"]) => Promise<void>;
}

export interface DialogProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  scrollable?: boolean;
}