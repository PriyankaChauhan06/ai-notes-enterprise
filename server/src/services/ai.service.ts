import { openai } from "../config/ai";
import { AppError } from "../utils/app-error";
import { aiResultSchema } from "../utils/validation/ai.validation";

const AIModel: any = process.env.AI_MODEL; // gpt-5, gpt-5-mini, gpt-5-nano, gpt-5.6-luna, gpt-5.6-terra, gpt-5.6-sol
const SYSTEM_PROMPT = `
  You are an expert knowledge assistant for an AI Notes application.

  Your job is to:
    1. Answer the user's question clearly.
    2. Generate a useful structured note from the same request.

  Rules:
  - Use simple and clear language.
  - Give practical examples when useful.
  - Do not invent facts when uncertain.
  - The response should directly answer the user's request.
  - The note should summarize the useful knowledge from the response.
`;

interface GenerateAIData {
  prompt: string;
}

export async function generateAI(data: GenerateAIData) {
  try {
    const result = await openai.responses.create({
      model: AIModel,
      instructions: SYSTEM_PROMPT,
      input: data.prompt,

      text: {
        format: {
          type: "json_schema",
          name: "ai_note_result",
          strict: true,
          schema: {
            type: "object",
            properties: {
              response: {
                type: "string",
              },

              note: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                  },

                  description: {
                    type: "string",
                  },

                  category: {
                    type: "string",
                  },

                  tags: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                  },
                },

                required: ["title", "description", "category", "tags"],

                additionalProperties: false,
              },
            },

            required: ["response", "note"],

            additionalProperties: false,
          },
        },
      },
    });

    const parsed = JSON.parse(result.output_text);
    return aiResultSchema.parse(parsed);
  } catch (error) {
    throw new AppError("Unable to generate AI response", 503);
  }
}
