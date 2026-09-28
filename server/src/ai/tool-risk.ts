export type ToolRisk = "read" | "low_write" | "high_write" | "destructive";

export const toolRisk: Record<string, ToolRisk> = {
  search_my_notes: "read",
  get_note: "read",

  create_note: "low_write",

  update_note: "high_write",
  delete_note: "destructive",
};
