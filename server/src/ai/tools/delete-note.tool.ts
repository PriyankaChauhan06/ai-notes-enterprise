export const deleteNoteTool = {
  type: "function" as const,
  name: "delete_note",
  description:
    "Delete one of the current user's notes. Use this only after the user has explicitly confirmed that the note should be deleted.",
  strict: true,
  parameters: {
    type: "object",
    properties: {
      noteId: {
        type: "string",
        description: "The MongoDB ID of the note to delete.",
      },
    },
    required: ["noteId"],
    additionalProperties: false,
  },
};
