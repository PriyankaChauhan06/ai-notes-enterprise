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

export interface GenerateAIResponse {
  success: boolean;
  data: AIResult;
}
