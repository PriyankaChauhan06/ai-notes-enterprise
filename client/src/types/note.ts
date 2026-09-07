export interface Note {
  id: number;
  title: string;
  description: string;
  category: string;
  tags: string[];
  isFavorite: boolean;
  source: "manual" | "ai";
}
