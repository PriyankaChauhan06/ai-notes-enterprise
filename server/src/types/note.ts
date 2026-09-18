export interface CreateNoteData {
  title: string;
  description: string;
  category: string;
  tags?: string[];
  isFavorite?: boolean;
  source?: "manual" | "ai";
}