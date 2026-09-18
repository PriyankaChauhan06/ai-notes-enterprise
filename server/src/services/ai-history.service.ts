import { Types } from "mongoose";
import AIConversation from "../models/AIConversation";

export async function getAIHistory(userId: string) {
  return AIConversation.find({ userId: new Types.ObjectId(userId) })
    .sort({ createdAt: -1 })
    .limit(50)
    .select("_id question answer sources createdAt");
}
