export const getNoteTool = {
  type: "function" as const,

  name: "get_note",

  description:
    "Get the full details of one note from the current user's notes. Use this when you need more complete information about a specific note.",

  strict: true,

  parameters: {
    type: "object",

    properties: {
      noteId: {
        type: "string",
        description: "The MongoDB ID of the note to retrieve.",
      },
    },

    required: ["noteId"],

    additionalProperties: false,
  },
};
