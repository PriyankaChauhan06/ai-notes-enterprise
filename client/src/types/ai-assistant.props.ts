export interface AINote {
  title: string;
  description: string;
  category: string;
  tags: string[];
}

export interface AIResult {
  response: string;
  note: AINote;
}

export interface GenerateAIAndRAGResponse {
  success: boolean;
  data: AIResult;
}

export interface AISource {
  noteId: string;
  title: string;
  category: string;
  score: number;
}

export interface RAGResult {
  answer: string;
  sources: AISource[];
}
