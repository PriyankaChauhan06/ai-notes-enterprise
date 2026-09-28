import type { Note } from "./note";

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

export interface AIHistorySource {
  noteId: string;
  title: string;
  score: number;
}

export interface AIConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AIConversation {
  _id: string;
  messages: AIConversationMessage[];
  createdAt: string;
  updatedAt: string;
}

// export interface AIConversation {
//   _id: string;
//   question: string;
//   answer: string;
//   sources: AIHistorySource[];
//   createdAt: string;
// }

export interface AIHistoryResponse {
  success: boolean;
  data: AIConversation[];
}

export interface AskAIRequest {
  question: string;
  conversationId?: string | null;
}

export interface AskAIResponse {
  conversationId: string;
  answer: string;

  createdNote?: Note;
  deletedNote?: Note;
  updatedNote?: Note;

  conversationDeleted?: boolean;

  pendingAction?: {
    actionType: "delete_note" | "update_note";
    noteId: string;
    updates?: {
      title?: string;
      description?: string;
      category?: string;
      tags?: string[];
    };
  };
}
