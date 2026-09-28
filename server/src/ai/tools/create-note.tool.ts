export const createNoteTool = {
  type: "function" as const,

  name: "create_note",

  description:
    "Create and save a new note for the current user. Use this tool only when the user explicitly asks to save or create a note.",

  strict: true,

  parameters: {
    type: "object",

    properties: {
      title: {
        type: "string",
        description: "A concise title for the note.",
      },

      description: {
        type: "string",
        description: "The main content of the note.",
      },

      category: {
        type: "string",
        description: "The most appropriate category for the note.",
      },

      tags: {
        type: "array",
        items: {
          type: "string",
        },
        description: "Relevant tags for the note.",
      },
    },

    required: ["title", "description", "category", "tags"],

    additionalProperties: false,
  },
};
