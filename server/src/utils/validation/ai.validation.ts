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

export const semanticSearchSchema = z.object({
  query: z
    .string()
    .trim()
    .min(1, "Query is required")
    .max(1000, "Query is too long"),
});

export const askRAGSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, "Question is required")
    .max(2000, "Question is too long"),
});
