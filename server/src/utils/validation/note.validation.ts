import { z } from "zod";

export const createNoteSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1, "Description is required"),
  category: z.string().trim().min(1, "Category is required"),
  tags: z.array(z.string().trim()).default([]),
  source: z.enum(["manual", "ai"]).default("manual"),
});

export const updateNoteSchema = createNoteSchema.partial().extend({
  isFavorite: z.boolean().optional(),
});
