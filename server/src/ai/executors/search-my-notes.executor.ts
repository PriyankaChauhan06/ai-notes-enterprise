import { semanticSearch } from "../../services/search.service";
import { searchMyNotesToolSchema } from "../../utils/validation/agent.validation";

export async function executeSearchMyNotes(userId: string, args: unknown) {
  const data = searchMyNotesToolSchema.parse(args);
  return await semanticSearch({ userId, query: data.query });
}
