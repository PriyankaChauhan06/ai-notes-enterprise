import { AppError } from "../utils/app-error";

export function validateCreateIntent(question: string) {
  const normalizedQuestion = question.trim().toLowerCase();

  const createIntentPatterns = [
    /\bcreate\b/,
    /\bmake\b.*\bnote\b/,
    /\bsave\b/,
    /\bstore\b/,
    /\badd\b.*\bnote\b/,
    /\bwrite\b.*\bnote\b/,
  ];

  const hasCreateIntent = createIntentPatterns.some((pattern) =>
    pattern.test(normalizedQuestion),
  );

  if (!hasCreateIntent) {
    throw new AppError("Creating a note requires explicit user intent.", 400);
  }
}
