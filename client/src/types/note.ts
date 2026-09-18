export interface Note {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  isFavorite: boolean;
  source: "manual" | "ai";
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateNoteData {
  title: string;
  description: string;
  category: string;
  tags: string[];
  source: "manual" | "ai";
}


export interface ApiResponse<T> {
  success: boolean;
  data: T;
}
