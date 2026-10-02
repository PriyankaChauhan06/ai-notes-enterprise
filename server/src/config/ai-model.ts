import { MODEL_PRICING } from "../ai/model-pricing";

const configuredModel = process.env.AI_MODEL ?? "gpt-5-mini";

if (!configuredModel) {
  throw new Error("AI_MODEL is not configured");
}

if (!(configuredModel in MODEL_PRICING)) {
  throw new Error(`Unsupported AI_MODEL: ${configuredModel}`);
}

export const AIModel = configuredModel;
