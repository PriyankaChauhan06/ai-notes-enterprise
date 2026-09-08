export interface Note {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  isFavorite: boolean;
  source: "manual" | "ai";
  createdAt?: string;
  updatedAt?: string;
}