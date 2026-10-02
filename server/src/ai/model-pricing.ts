import { ModelPricing } from "../types/pricing";

const AIModel = process.env.AI_MODEL ?? "gpt-5-mini";

// satisfies: It tells TypeScript to verify that each pricing object contains "inputPerMillion" & "outputPerMillion" as valid numbers.
export const MODEL_PRICING = {
  [AIModel]: { inputPerMillion: 0.25, outputPerMillion: 2.0 },
} satisfies Record<string, ModelPricing>;

// but along with it preserve actual keys of TypeScript so currently SupportedModel is "AIModel"
export type SupportedModel = keyof typeof MODEL_PRICING;

export function calculateModelCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
) {
  if (inputTokens < 0 || outputTokens < 0) {
    throw new Error("Token counts cannot be negative");
  }

  const pricing = MODEL_PRICING[model];
  if (!pricing) throw new Error(`Pricing not configured for model: ${model}`);

  const inputCost = (inputTokens / 1_000_000) * pricing.inputPerMillion;
  const outputCost = (outputTokens / 1_000_000) * pricing.outputPerMillion;

  return inputCost + outputCost;
}
