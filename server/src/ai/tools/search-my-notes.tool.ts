export const searchMyNotesTool = {
  type: "function" as const,

  name: "search_my_notes",

  description:
    "Search the current user's notes using semantic search. Use this when the user asks about information that may exist in their saved notes.",

  strict: true,

  parameters: {
    type: "object",

    properties: {
      query: {
        type: "string",
        description:
          "The search query describing the information to find in the user's notes.",
      },
    },

    required: ["query"],

    additionalProperties: false,
  },
};

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
