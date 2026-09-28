export const updateNoteTool = {
  type: "function" as const,
  name: "update_note",
  description:
    "Prepare an update for one of the current user's notes. Use this only when the user explicitly asks to modify or update a note. The update must be confirmed by the user before it is applied.",
  strict: true,
  parameters: {
    type: "object",
    properties: {
      noteId: {
        type: "string",
        description: "The MongoDB ID of the note to update.",
      },

      title: {
        type: "string",
        description:
          "New title for the note, if the user requested a title change.",
      },

      description: {
        type: "string",
        description:
          "New description for the note, if the user requested a description change.",
      },

      category: {
        type: "string",
        description:
          "New category for the note, if the user requested a category change.",
      },

      tags: {
        type: "array",
        items: {
          type: "string",
        },
        description:
          "New tags for the note, if the user requested a tag change.",
      },
    },

    required: ["noteId", "title", "description", "category", "tags"],
    additionalProperties: false,
  },
};
