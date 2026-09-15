import { z } from "zod";

export const generateAISchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(1, "Prompt is required")
    .max(5000, "Prompt is too long"),
});

export const aiResultSchema = z.object({
  response: z.string(),
  note: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    tags: z.array(z.string()),
  }),
});
