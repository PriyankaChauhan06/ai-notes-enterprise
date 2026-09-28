import { AppError } from "../utils/app-error";
import { toolRisk } from "./tool-risk";

export function validateToolAccess(toolName: string) {
  const risk = toolRisk[toolName];

  if (!risk) {
    throw new AppError(`Tool "${toolName}" is not allowed`, 403);
  }

  return risk;
}
