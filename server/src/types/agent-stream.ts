export interface StreamAgentData {
  userId: string;
  question: string;
  conversationId?: string;
  onEvent: (event: AgentStreamEvent) => void;
}

export type AgentStreamEvent =
  | { type: "text"; text: string }
  | { type: "tool_start"; toolName: string }
  | { type: "tool_result"; toolName: string; success: boolean }
  | {
      type: "pending_action";
      actionType: "delete_note" | "update_note";
      noteId: string;
    }
  | { type: "done"; conversationId: string }
  | { type: "error"; message: string };
