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
