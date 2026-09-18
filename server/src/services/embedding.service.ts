import { openai } from "../config/ai";
import { AppError } from "../utils/app-error";

const OpenAIModel: any = process.env.OPEN_AI_MODEL; // embedding model

export const generateEmbedding = async (text: string) => {
  try {
    const response = await openai.embeddings.create({
      model: OpenAIModel,
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    throw new AppError("Unable to generate embedding", 503);
  }
};

export async function generateEmbeddings(texts: string[]) {
  if (texts.length === 0) return [];

  try {
    const response = await openai.embeddings.create({
      model: OpenAIModel,
      input: texts,
    });

    return response.data
      .sort((a, b) => a.index - b.index) // sort() is intentionally there so that embeddings remain aligned with the input order.
      .map((item) => item.embedding);
  } catch (error) {
    throw new AppError("Unable to generate embeddings", 503);
  }
}
