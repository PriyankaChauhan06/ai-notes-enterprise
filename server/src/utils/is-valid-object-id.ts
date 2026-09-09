import { isValidObjectId } from "mongoose";
import { AppError } from "./app-error";

export function getParamId(id: string | string[]): any {
  if (typeof id !== "string") {
    throw new AppError("Invalid note id", 400);
  }

  return id;
}

export function isValidNoteId(id: string) {
  return isValidObjectId(id);
}
